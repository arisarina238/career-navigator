import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'career-navigator-secret-key-spb-2026';
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const AI_MODEL = process.env.AI_MODEL || 'qwen3:8b';

app.use(cors());
app.use(express.json());

// Helper: Normalize role string to Prisma Role enum
function normalizeRole(inputRole) {
  if (!inputRole) return 'STUDENT';
  const r = inputRole.trim().toUpperCase();
  if (r === 'PARTICIPANT' || r === 'STUDENT' || r === 'ШКОЛЬНИК' || r === 'УЧАСТНИК') return 'STUDENT';
  if (r === 'MENTOR' || r === 'НАСТАВНИК' || r === 'КУРАТОР') return 'MENTOR';
  if (r === 'PARENT' || r === 'РОДИТЕЛЬ') return 'PARENT';
  if (r === 'EMPLOYER' || r === 'РАБОТОДАТЕЛЬ' || r === 'КОМПАНИЯ') return 'EMPLOYER';
  if (r === 'ADMIN' || r === 'АДМИНИСТРАТОР') return 'ADMIN';
  return 'STUDENT';
}

// Helper: Format User object for client response (without passwordHash)
function formatUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: user.phone || null,
    gosuslugiVerified: Boolean(user.gosuslugiVerified),
    studentProfile: user.studentProfile || null,
    mentorProfile: user.mentorProfile || null,
    parentProfile: user.parentProfile || null,
    employerProfile: user.employerProfile || null
  };
}

// Helper: Extract authenticated user from Authorization header
async function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) return null;
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
        mentorProfile: true,
        parentProfile: true,
        employerProfile: true
      }
    });
  } catch (err) {
    return null;
  }
}

// Helper: Generate default roadmap stages for a student
async function createDefaultRoadmapForStudent(studentId) {
  const defaultStages = [
    {
      stageNumber: 1,
      title: '1. Школа & ИИ-Диагностика',
      status: 'IN_PROGRESS',
      badge: 'Текущий этап',
      subtitle: 'Выявление склонностей (Холланд/Климов)',
      description: 'Определены сильные стороны в сферах IT и Инженерии. Поставлена цель на профильное обучение.',
      order: 1,
      milestones: [
        { title: 'Прохождение комплексного ИИ-теста RIASEC', isCompleted: false },
        { title: 'Формирование цифрового профиля ученика', isCompleted: false }
      ]
    },
    {
      stageNumber: 2,
      title: '2. Профпробы в АИТУ',
      status: 'UPCOMING',
      badge: 'Предстоит',
      subtitle: 'Практические пробные погружения',
      description: 'Запланировано 3 пробы: Frontend React, 3D Печать ЧПУ, Data Science.',
      order: 2,
      milestones: [
        { title: 'Очная проба «Разработка веб-приложения на React»', isCompleted: false },
        { title: 'Практикум «3D-моделирование и печать деталей на ЧПУ»', isCompleted: false }
      ]
    },
    {
      stageNumber: 3,
      title: '3. Профильное Образование',
      status: 'UPCOMING',
      badge: 'Предстоит',
      subtitle: 'ВУЗ / Колледж партнер (СПб)',
      description: 'Рекомендуемые заведения: Колледж информационных технологий СПб / СПбПУ Петра Великого (Информатика и ВТ).',
      order: 3,
      milestones: [
        { title: 'Выбор направления СПО/ВУЗ', isCompleted: false },
        { title: 'Подготовка к профильным олимпиадам', isCompleted: false }
      ]
    },
    {
      stageNumber: 4,
      title: '4. Стажировка & Работа',
      status: 'UPCOMING',
      badge: 'Целевая точка',
      subtitle: 'Партнеры работодатели СПб',
      description: 'ПАО «Газпром Нефть ЦР», VK СПб, Т-Банк Dev — стажировка на 3-м курсе с гарантией трудоустройства.',
      order: 4,
      milestones: [
        { title: 'Целевой договор со стажировкой', isCompleted: false }
      ]
    }
  ];

  for (const st of defaultStages) {
    const { milestones, ...stFields } = st;
    await prisma.roadmapStage.create({
      data: {
        ...stFields,
        studentId,
        milestones: {
          create: milestones
        }
      }
    });
  }
}

// ==========================================
// 0. AUTHENTICATION (ВХОД И РЕГИСТРАЦИЯ)
// ==========================================

// Регистрация нового пользователя с защищенным хешированием пароля (bcrypt)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'Заполните обязательные поля: имя, email, пароль.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким адресом электронной почты уже существует.' });
    }

    // Хешируем пароль с помощью bcryptjs (10 раундов соли)
    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName ? lastName.trim() : ''}`.trim();
    const roleEnum = normalizeRole(role);

    // Подбираем стартовый аватар
    let defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    if (roleEnum === 'MENTOR') {
      defaultAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
    } else if (roleEnum === 'PARENT') {
      defaultAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
    } else if (roleEnum === 'EMPLOYER') {
      defaultAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';
    }

    // Формируем профиль в зависимости от роли
    const createData = {
      email: normalizedEmail,
      passwordHash,
      fullName,
      role: roleEnum,
      avatarUrl: defaultAvatar,
      gosuslugiVerified: true
    };

    if (roleEnum === 'STUDENT') {
      createData.studentProfile = {
        create: {
          school: 'ГБОУ СОШ Санкт-Петербурга',
          grade: '9 класс',
          currentScenario: 'A',
          progressPercent: 10
        }
      };
    } else if (roleEnum === 'MENTOR') {
      createData.mentorProfile = {
        create: {
          organization: 'МЦК АИТУ / ГБОУ СОШ СПб',
          position: 'Куратор карьерных траекторий'
        }
      };
    } else if (roleEnum === 'PARENT') {
      createData.parentProfile = {
        create: {}
      };
    } else if (roleEnum === 'EMPLOYER') {
      createData.employerProfile = {
        create: {
          companyName: 'Организация-партнер СПб',
          industry: 'IT & Инженерия',
          address: 'г. Санкт-Петербург'
        }
      };
    }

    const user = await prisma.user.create({
      data: createData,
      include: {
        studentProfile: true,
        mentorProfile: true,
        parentProfile: true,
        employerProfile: true
      }
    });

    // Если это школьник, создаем для него стартовые этапы дорожной карты
    if (user.studentProfile) {
      await createDefaultRoadmapForStudent(user.studentProfile.id);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Регистрация успешно выполнена',
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Ошибка сервера при регистрации' });
  }
});

// Авторизация пользователя с проверкой хеша пароля
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите адрес электронной почты и пароль.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: true,
        mentorProfile: true,
        parentProfile: true,
        employerProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный адрес электронной почты или пароль.' });
    }

    let isPasswordValid = false;

    if (user.passwordHash) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Для демо-пользователей без установленного хеша пароля
      if (password === 'password123' || password === '123456') {
        isPasswordValid = true;
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash }
        });
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный адрес электронной почты или пароль.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Авторизация успешна',
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Ошибка сервера при входе' });
  }
});

// Получить текущего авторизованного пользователя по токену
app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Токен недействителен или сессия истекла' });
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 1. HEALTH & ROLES
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Career Navigator API (Prisma + PostgreSQL)' });
});

// Получить список ролей для демо-переключателя
app.get('/api/users/roles', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: true,
        mentorProfile: true,
        parentProfile: true,
        employerProfile: true
      }
    });

    const roles = {
      STUDENT: users.find((u) => u.role === 'STUDENT') ? formatUserResponse(users.find((u) => u.role === 'STUDENT')) : null,
      MENTOR: users.find((u) => u.role === 'MENTOR') ? formatUserResponse(users.find((u) => u.role === 'MENTOR')) : null,
      PARENT: users.find((u) => u.role === 'PARENT') ? formatUserResponse(users.find((u) => u.role === 'PARENT')) : null,
      EMPLOYER: users.find((u) => u.role === 'EMPLOYER') ? formatUserResponse(users.find((u) => u.role === 'EMPLOYER')) : null
    };

    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. ЦИФРОВОЙ ПРОФИЛЬ ШКОЛЬНИКА
// ==========================================

app.get('/api/profile/student', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: authUser.studentProfile.id },
      include: {
        user: true,
        mentor: { include: { user: true } },
        parent: { include: { user: true } },
        trialBookings: {
          include: {
            trial: { include: { zone: true } }
          }
        },
        diagnosticResults: {
          orderBy: { completedAt: 'desc' },
          take: 1
        },
        roadmapStages: {
          orderBy: { stageNumber: 'asc' },
          include: { milestones: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Профиль ученика не найден' });
    }

    const latestDiag = student.diagnosticResults[0];
    const topRecommendation = latestDiag?.topDirections?.[0]?.name || (latestDiag ? 'IT & Аналитика' : 'Тест еще не пройден');
    const topMatch = latestDiag?.topDirections?.[0]?.match || (latestDiag ? 94 : null);

    res.json({
      id: student.id,
      userId: student.userId,
      name: student.user.fullName,
      email: student.user.email,
      phone: student.user.phone || null,
      avatar: student.user.avatarUrl,
      grade: student.grade || '9 класс',
      school: student.school || 'ГБОУ СОШ Санкт-Петербурга',
      snils: student.snils || 'Не указан',
      gosuslugiVerified: student.user.gosuslugiVerified,
      currentScenario: student.currentScenario || 'A',
      progressPercent: student.progressPercent || 0,
      hasTakenDiagnostic: Boolean(latestDiag),
      topRecommendation,
      topMatch,
      completedTrialsCount: student.trialBookings.filter((b) => b.status === 'ATTENDED' || b.status === 'CONFIRMED').length,
      upcomingTrials: student.trialBookings.map((b) => ({
        id: b.id,
        trialId: b.trialId,
        title: b.trial?.title || 'Профессиональная проба',
        format: b.trial?.format || 'Очный практикум',
        duration: b.trial?.duration || '1.5 часа',
        address: b.trial?.address || 'Санкт-Петербург',
        metro: b.trial?.metro || null,
        nextDate: b.trial?.nextDate ? b.trial.nextDate.toISOString().replace('T', ' ').substring(0, 16) : '',
        status: b.status,
        zoneName: b.trial?.zone?.name || 'АИТУ',
        zoneColor: b.trial?.zone?.color || '#0066ff',
        employerName: b.trial?.employer?.companyName || null,
        description: b.trial?.description || ''
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление профиля ученика
app.put('/api/profile/student', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }

    const { school, grade, snils, phone, currentScenario, progressPercent, fullName } = req.body;

    if (fullName || phone !== undefined) {
      await prisma.user.update({
        where: { id: authUser.id },
        data: {
          fullName: fullName ? fullName.trim() : authUser.fullName,
          phone: phone !== undefined ? phone : authUser.phone
        }
      });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { id: authUser.studentProfile.id },
      data: {
        school: school !== undefined ? school : authUser.studentProfile.school,
        grade: grade !== undefined ? grade : authUser.studentProfile.grade,
        snils: snils !== undefined ? snils : authUser.studentProfile.snils,
        currentScenario: currentScenario ? (currentScenario === 'B' ? 'B' : currentScenario === 'C' ? 'C' : 'A') : authUser.studentProfile.currentScenario,
        progressPercent: progressPercent !== undefined ? Number(progressPercent) : authUser.studentProfile.progressPercent
      }
    });

    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. ДИАГНОСТИКА (RIASEC / КЛИМОВ)
// ==========================================

app.get('/api/diagnostics/questions', async (req, res) => {
  try {
    const questions = await prisma.diagnosticQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        options: true
      }
    });

    res.json(
      questions.map((q) => ({
        id: q.id,
        category: q.category,
        question: q.questionText,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.optionText,
          scores: opt.scores
        }))
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить последний результат диагностики ученика
app.get('/api/diagnostics/result', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const result = await prisma.diagnosticResult.findFirst({
      where: { studentId: student.id },
      orderBy: { completedAt: 'desc' }
    });

    if (!result) {
      return res.json(null); // тест ещё не пройден
    }

    res.json({
      id: result.id,
      date: result.completedAt.toISOString().split('T')[0],
      topDirections: result.topDirections,
      scoresDistribution: result.scoresDistribution,
      strengths: result.strengths
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/diagnostics/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    // Расчет баллов
    const totalScores = { it: 0, engineering: 0, design: 0, medicine: 0, biz: 0 };
    if (Array.isArray(answers)) {
      for (const ans of answers) {
        if (ans.scores) {
          for (const [key, val] of Object.entries(ans.scores)) {
            totalScores[key] = (totalScores[key] || 0) + Number(val);
          }
        }
      }
    }

    const totalPoints = Object.values(totalScores).reduce((a, b) => a + b, 0) || 1;
    const itPct = Math.min(100, Math.max(10, Math.round(((totalScores.it || 0) / totalPoints) * 100))) || 94;
    const engPct = Math.min(100, Math.max(10, Math.round(((totalScores.engineering || 0) / totalPoints) * 100))) || 87;
    const desPct = Math.min(100, Math.max(10, Math.round(((totalScores.design || 0) / totalPoints) * 100))) || 72;
    const bizPct = Math.min(100, Math.max(10, Math.round(((totalScores.biz || 0) / totalPoints) * 100))) || 65;
    const medPct = Math.min(100, Math.max(10, Math.round(((totalScores.medicine || 0) / totalPoints) * 100))) || 40;

    const topDirections = [
      { name: 'Data Analyst & Web Dev', match: itPct, category: 'IT', desc: 'Высокое аналитическое мышление и интерес к цифровым продуктам' },
      { name: 'Инженер-конструктор ЧПУ', match: engPct, category: 'Инженерия', desc: 'Отличные пространственные способности и системное мышление' },
      { name: 'UX/UI Дизайнер продуктов', match: desPct, category: 'Дизайн', desc: 'Умеренная креативная склонность с фокусом на логику интерфейса' }
    ].sort((a, b) => b.match - a.match);

    const scoresDistribution = [
      { label: 'IT & Программирование', percent: itPct, color: '#0284c7' },
      { label: 'Инженерия и CAD', percent: engPct, color: '#2563eb' },
      { label: 'Креативный Дизайн', percent: desPct, color: '#ec4899' },
      { label: 'Бизнес и Проекты', percent: bizPct, color: '#f59e0b' },
      { label: 'Биомед & Естествознание', percent: medPct, color: '#10b981' }
    ];

    const strengths = [
      'Аналитический склад ума и склонность к алгоритмизации',
      'Высокая усидчивость при работе с цифровыми массивами данных',
      'Интерес к современным веб-технологиям и языкам программирования',
      'Развитое логическое восприятие причинно-следственных связей'
    ];

    const result = await prisma.diagnosticResult.create({
      data: {
        studentId: student.id,
        topDirections,
        scoresDistribution,
        strengths,
        rawAnswers: answers
      }
    });

    // Обновляем прогресс студента
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        progressPercent: Math.max(student.progressPercent || 0, 45)
      }
    });

    res.json({
      id: result.id,
      date: result.completedAt.toISOString().split('T')[0],
      topDirections,
      scoresDistribution,
      strengths
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. ЗОНЫ АИТУ И ПРОФПРОБЫ
// ==========================================

app.get('/api/zones', async (req, res) => {
  try {
    const zones = await prisma.aituZone.findMany({
      include: {
        trials: {
          include: {
            employer: true
          }
        }
      }
    });

    // Получаем список trialId, на которые записан текущий пользователь
    let bookedTrialIds = new Set();
    const authUser = await getAuthUser(req).catch(() => null);
    if (authUser && authUser.studentProfile) {
      const bookings = await prisma.trialBooking.findMany({
        where: {
          studentId: authUser.studentProfile.id,
          status: { not: 'CANCELLED' }
        },
        select: { trialId: true }
      });
      bookedTrialIds = new Set(bookings.map((b) => b.trialId));
    }

    const formatted = zones.map((z) => ({
      id: z.id,
      name: z.name,
      icon: z.icon,
      color: z.color,
      bgGradient: z.bgGradient,
      description: z.description,
      hotZone: z.isHotZone,
      trialsCount: z.trials.length,
      popularTrial: z.popularTrial,
      trials: z.trials.map((t) => ({
        id: t.id,
        title: t.title,
        format: t.format,
        duration: t.duration,
        address: t.address,
        metro: t.metro,
        nextDate: t.nextDate.toISOString().replace('T', ' ').substring(0, 16),
        availableSlots: t.availableSlots,
        maxSlots: t.maxSlots,
        ageLimit: t.ageLimit,
        tags: t.tags,
        rating: t.rating,
        reviewsCount: t.reviewsCount,
        description: t.description,
        employer: t.employer ? t.employer.companyName : null,
        isBooked: bookedTrialIds.has(t.id)
      }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запись на профпробу
app.post('/api/trials/:trialId/book', async (req, res) => {
  try {
    const { trialId } = req.params;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: authUser.studentProfile.id },
      include: { parent: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Профиль ученика не найден' });
    }

    const trial = await prisma.proTrial.findUnique({ where: { id: trialId } });
    if (!trial) {
      return res.status(404).json({ error: 'Профпроба не найдена' });
    }

    if (trial.availableSlots <= 0) {
      return res.status(400).json({ error: 'Нет свободных мест на данную пробу' });
    }

    // Создаем бронирование или обновляем
    const booking = await prisma.trialBooking.upsert({
      where: {
        trialId_studentId: {
          trialId,
          studentId: student.id
        }
      },
      create: {
        trialId,
        studentId: student.id,
        status: 'REGISTERED'
      },
      update: {
        status: 'REGISTERED'
      }
    });

    // Уменьшаем количество доступных слотов
    await prisma.proTrial.update({
      where: { id: trialId },
      data: { availableSlots: { decrement: 1 } }
    });

    // Создаем запрос согласия родителю
    if (student.parentId) {
      await prisma.parentApproval.create({
        data: {
          parentId: student.parentId,
          studentId: student.id,
          bookingId: booking.id,
          status: 'PENDING',
          title: `Запись на профпробу «${trial.title}»`
        }
      });
    }

    // Обновляем рекомендацию ИИ (помечаем как принятую/забронированную)
    await prisma.aIRecommendation.updateMany({
      where: {
        studentId: student.id,
        relatedTrialId: trialId,
        status: 'ACTIVE'
      },
      data: {
        status: 'ACCEPTED'
      }
    });

    const fullBooking = await prisma.trialBooking.findUnique({
      where: { id: booking.id },
      include: {
        trial: {
          include: { zone: true, employer: true }
        }
      }
    });

    res.json({ success: true, booking: fullBooking || booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. КАРЬЕРНЫЙ МАРШРУТ (ROADMAP)
// ==========================================

app.get('/api/roadmap', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    let stages = await prisma.roadmapStage.findMany({
      where: { studentId: student.id },
      orderBy: { stageNumber: 'asc' },
      include: { milestones: true }
    });

    // Если этапы еще не созданы, автогенерируем в БД
    if (!stages || stages.length === 0) {
      await createDefaultRoadmapForStudent(student.id);
      stages = await prisma.roadmapStage.findMany({
        where: { studentId: student.id },
        orderBy: { stageNumber: 'asc' },
        include: { milestones: true }
      });
    }

    // ===== Автосинхронизация статусов этапов по реальным данным =====

    // 1. Проверяем, прошёл ли тест диагностики
    const diagResult = await prisma.diagnosticResult.findFirst({
      where: { studentId: student.id },
      orderBy: { completedAt: 'desc' }
    });
    const hasDiagnostic = !!diagResult;

    // 2. Проверяем бронирования профпроб
    const bookings = await prisma.trialBooking.findMany({
      where: { studentId: student.id, status: { not: 'CANCELLED' } }
    });
    const hasBooking = bookings.length > 0;
    const hasAttended = bookings.some((b) => b.status === 'ATTENDED');

    // 3. Вычисляем новые статусы для каждого этапа
    const newStatuses = {};
    // Этап 1: Диагностика
    if (hasDiagnostic) {
      newStatuses[1] = 'COMPLETED';
    } else {
      newStatuses[1] = 'IN_PROGRESS'; // всегда активен для новых
    }
    // Этап 2: Профпробы
    if (hasAttended) {
      newStatuses[2] = 'COMPLETED';
    } else if (hasBooking) {
      newStatuses[2] = 'IN_PROGRESS';
    } else if (hasDiagnostic) {
      newStatuses[2] = 'IN_PROGRESS'; // диагностика пройдена → пора записываться
    } else {
      newStatuses[2] = 'UPCOMING';
    }
    // Этап 3: Образование
    if (hasAttended) {
      newStatuses[3] = 'IN_PROGRESS';
    } else {
      newStatuses[3] = 'UPCOMING';
    }
    // Этап 4: Стажировка — всегда upcoming пока нет данных
    newStatuses[4] = 'UPCOMING';

    // Обновляем milestone для этапа 1 (тест диагностики)
    const stage1 = stages.find((s) => s.stageNumber === 1);
    if (stage1 && hasDiagnostic) {
      // Помечаем milestone "Прохождение теста" как выполненный
      const diagMilestone = stage1.milestones.find((m) =>
        m.title.toLowerCase().includes('riasec') || m.title.toLowerCase().includes('тест')
      );
      if (diagMilestone && !diagMilestone.isCompleted) {
        await prisma.roadmapMilestone.update({
          where: { id: diagMilestone.id },
          data: { isCompleted: true }
        });
      }
      // Помечаем milestone "Цифровой профиль" как выполненный
      const profileMilestone = stage1.milestones.find((m) =>
        m.title.toLowerCase().includes('профил')
      );
      if (profileMilestone && !profileMilestone.isCompleted) {
        await prisma.roadmapMilestone.update({
          where: { id: profileMilestone.id },
          data: { isCompleted: true }
        });
      }
    }

    // Обновляем milestone для этапа 2 (профпробы)
    const stage2 = stages.find((s) => s.stageNumber === 2);
    if (stage2 && hasBooking) {
      const probeMilestone = stage2.milestones[0];
      if (probeMilestone && !probeMilestone.isCompleted && hasAttended) {
        await prisma.roadmapMilestone.update({
          where: { id: probeMilestone.id },
          data: { isCompleted: true }
        });
      }
    }

    // Применяем обновления статусов в БД (только если изменились)
    for (const stage of stages) {
      const newStatus = newStatuses[stage.stageNumber];
      if (newStatus && stage.status !== newStatus) {
        await prisma.roadmapStage.update({
          where: { id: stage.id },
          data: {
            status: newStatus,
            badge:
              newStatus === 'COMPLETED' ? 'Пройдено' :
              newStatus === 'IN_PROGRESS' ? 'Текущий этап' :
              'Предстоит'
          }
        });
      }
    }

    // Перезагружаем обновлённые этапы
    stages = await prisma.roadmapStage.findMany({
      where: { studentId: student.id },
      orderBy: { stageNumber: 'asc' },
      include: { milestones: true }
    });

    const statusMap = {
      COMPLETED: 'completed',
      IN_PROGRESS: 'in_progress',
      UPCOMING: 'upcoming',
      PENDING: 'pending'
    };

    res.json(
      stages.map((s) => ({
        id: `stage-${s.stageNumber}`,
        stageId: s.id,
        stageNumber: s.stageNumber,
        title: s.title,
        status: statusMap[s.status] || 'upcoming',
        badge: s.badge,
        subtitle: s.subtitle,
        description: s.description,
        milestones: s.milestones
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. РАБОТОДАТЕЛИ И ВАКАНСИИ
// ==========================================

app.get('/api/employers', async (req, res) => {
  try {
    const employers = await prisma.employerProfile.findMany({
      include: {
        vacancies: { where: { isActive: true } },
        trials: true
      }
    });

    res.json(
      employers.map((emp) => ({
        id: emp.id,
        name: emp.companyName,
        industry: emp.industry,
        address: emp.address,
        verified: emp.verified,
        description: emp.description,
        logo: emp.logoUrl,
        vacancies: emp.vacancies.map((v) => ({
          id: v.id,
          title: v.title,
          salary: v.salary,
          type: v.type === 'INTERNSHIP' ? 'Стажировка' : v.type === 'PRACTICE' ? 'Практика' : 'Для выпускников',
          requirements: v.requirements
        })),
        proTrials: emp.trials.map((t) => t.title)
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отклик на вакансию от ученика
app.post('/api/vacancies/:vacancyId/apply', async (req, res) => {
  try {
    const { vacancyId } = req.params;
    const { coverLetter } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const latestDiag = await prisma.diagnosticResult.findFirst({
      where: { studentId: student.id },
      orderBy: { completedAt: 'desc' }
    });
    const matchScore = latestDiag?.topDirections?.[0]?.match || 92;

    const application = await prisma.jobApplication.upsert({
      where: {
        vacancyId_studentId: {
          vacancyId,
          studentId: student.id
        }
      },
      create: {
        vacancyId,
        studentId: student.id,
        status: 'SUBMITTED',
        matchScore,
        coverLetter: coverLetter || 'Отклик через платформу Карьерный Навигатор СПб'
      },
      update: {
        status: 'SUBMITTED',
        coverLetter: coverLetter || 'Повторный отклик'
      }
    });

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. РОЛИ: НАСТАВНИК (MENTOR)
// ==========================================

// Профиль наставника
app.get('/api/mentor/profile', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.mentorProfile) {
      return res.status(401).json({ error: 'Требуется авторизация наставника' });
    }

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: authUser.mentorProfile.id },
      include: { user: true, students: { include: { user: true } } }
    });

    if (!mentor) return res.status(404).json({ error: 'Наставник не найден' });
    res.json({
      id: mentor.id,
      userId: mentor.userId,
      name: mentor.user.fullName,
      email: mentor.user.email,
      avatar: mentor.user.avatarUrl,
      organization: mentor.organization,
      position: mentor.position,
      assignedStudentsCount: mentor.students.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mentor/students', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.mentorProfile) {
      return res.status(401).json({ error: 'Требуется авторизация наставника' });
    }

    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
        diagnosticResults: { orderBy: { completedAt: 'desc' }, take: 1 },
        trialBookings: { include: { trial: true } },
        mentorReviews: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    res.json(
      students.map((st) => {
        const topDiag = st.diagnosticResults[0];
        const latestBooking = st.trialBookings[0];
        const latestReview = st.mentorReviews[0];

        return {
          id: st.id,
          name: st.user.fullName,
          avatar: st.user.avatarUrl,
          grade: st.grade || '9 класс',
          school: st.school || 'ГБОУ СОШ Санкт-Петербурга',
          aiRecommendation: topDiag?.topDirections?.[0]?.name || (topDiag ? 'IT & Разработка ПО' : 'Диагностика не пройдена'),
          matchPercent: topDiag?.topDirections?.[0]?.match || (topDiag ? 94 : 0),
          cluster: topDiag?.topDirections?.[0]?.category || 'IT',
          assignedTrial: latestBooking ? `${latestBooking.trial?.title || 'Проба'}` : 'Не зачислен',
          status: st.user.gosuslugiVerified ? 'verified' : 'pending',
          mentorComment: latestReview?.comment || 'Требуется вводная консультация'
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mentor/students/:studentId/note', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { comment } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.mentorProfile) {
      return res.status(401).json({ error: 'Требуется авторизация наставника' });
    }
    const mentor = authUser.mentorProfile;

    const review = await prisma.mentorReview.create({
      data: {
        mentorId: mentor.id,
        studentId,
        comment,
        isVerified: true
      }
    });

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Массовое бронирование выезда наставником для всех студентов
app.post('/api/mentor/bulk-book', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.mentorProfile) {
      return res.status(401).json({ error: 'Требуется авторизация наставника' });
    }
    const { trialId } = req.body;
    const targetTrial = trialId
      ? await prisma.proTrial.findUnique({ where: { id: trialId } })
      : await prisma.proTrial.findFirst();

    if (!targetTrial) {
      return res.status(404).json({ error: 'Профпроба не найдена' });
    }

    const students = await prisma.studentProfile.findMany();
    for (const student of students) {
      await prisma.trialBooking.upsert({
        where: {
          trialId_studentId: {
            trialId: targetTrial.id,
            studentId: student.id
          }
        },
        create: {
          trialId: targetTrial.id,
          studentId: student.id,
          status: 'REGISTERED'
        },
        update: {
          status: 'REGISTERED'
        }
      });
    }

    res.json({ success: true, count: students.length, trialTitle: targetTrial.title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. РОЛИ: РОДИТЕЛЬ (PARENT)
// ==========================================

// Профиль родителя и данные детей
app.get('/api/parent/profile', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.parentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация родителя' });
    }

    const parent = await prisma.parentProfile.findUnique({
      where: { id: authUser.parentProfile.id },
      include: {
        user: true,
        children: {
          include: {
            user: true,
            diagnosticResults: { orderBy: { completedAt: 'desc' }, take: 1 },
            trialBookings: { include: { trial: true } }
          }
        }
      }
    });

    if (!parent) return res.status(404).json({ error: 'Профиль родителя не найден' });

    const children = parent.children.map((c) => ({
      id: c.id,
      name: c.user.fullName,
      grade: c.grade || '9 класс',
      school: c.school || 'ГБОУ СОШ Санкт-Петербурга',
      avatar: c.user.avatarUrl,
      diagnosticResult: c.diagnosticResults[0] || null,
      upcomingTrials: c.trialBookings.map((b) => ({
        id: b.id,
        trialId: b.trialId,
        title: b.trial?.title,
        date: b.trial?.nextDate,
        address: b.trial?.address,
        status: b.status
      }))
    }));

    res.json({
      id: parent.id,
      name: parent.user.fullName,
      email: parent.user.email,
      avatar: parent.user.avatarUrl,
      children
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/parent/approvals', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.parentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация родителя' });
    }
    const parent = authUser.parentProfile;

    const approvals = await prisma.parentApproval.findMany({
      where: { parentId: parent.id },
      include: {
        student: { include: { user: true } },
        booking: { include: { trial: true } }
      }
    });

    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/parent/approvals/:approvalId/respond', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.parentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация родителя' });
    }
    const { approvalId } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED'

    const approval = await prisma.parentApproval.update({
      where: { id: approvalId },
      data: {
        status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date()
      },
      include: { booking: true }
    });

    if (approval.bookingId && status === 'APPROVED') {
      await prisma.trialBooking.update({
        where: { id: approval.bookingId },
        data: { status: 'CONFIRMED' }
      });
    }

    res.json({ success: true, approval });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 9. РОЛИ: РАБОТОДАТЕЛЬ (EMPLOYER)
// ==========================================

// Профиль компании работодателя
app.get('/api/employer/profile', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { id: authUser.employerProfile.id },
      include: {
        user: true,
        vacancies: true,
        trials: true
      }
    });

    if (!employer) return res.status(404).json({ error: 'Работодатель не найден' });

    res.json({
      id: employer.id,
      name: employer.user.fullName,
      email: employer.user.email,
      avatar: employer.user.avatarUrl,
      companyName: employer.companyName,
      industry: employer.industry,
      address: employer.address,
      description: employer.description,
      logoUrl: employer.logoUrl,
      vacanciesCount: employer.vacancies.length,
      trialsCount: employer.trials.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Список откликов кандидатов на вакансии работодателя
app.get('/api/employer/applicants', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    const applications = await prisma.jobApplication.findMany({
      where: {
        vacancy: {
          employerId: employer.id
        }
      },
      include: {
        vacancy: true,
        student: {
          include: {
            user: true,
            diagnosticResults: { orderBy: { completedAt: 'desc' }, take: 1 },
            trialBookings: { include: { trial: true } }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json(
      applications.map((appItem) => {
        const diag = appItem.student.diagnosticResults[0];
        const bookings = appItem.student.trialBookings.map((b) => b.trial?.title).filter(Boolean);
        return {
          id: appItem.id,
          name: appItem.student.user.fullName,
          avatar: appItem.student.user.avatarUrl,
          position: appItem.vacancy.title,
          match: appItem.matchScore ? `${appItem.matchScore}%` : `${diag?.topDirections?.[0]?.match || 90}%`,
          status: appItem.status === 'INVITED' ? 'Приглашен на интервью' : appItem.status === 'ACCEPTED' ? 'Принят' : appItem.status === 'REJECTED' ? 'Отклонен' : 'На рассмотрении',
          portfolio: bookings.length > 0 ? `Пробы: ${bookings.join(', ')}` : (diag ? `Диагностика: ${diag.topDirections?.[0]?.name}` : 'Цифровой профиль СПб'),
          date: appItem.appliedAt.toISOString().split('T')[0],
          coverLetter: appItem.coverLetter
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание новой вакансии работодателем
app.post('/api/employer/vacancies', async (req, res) => {
  try {
    const { title, salary, type, description, requirements } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    if (!title) return res.status(400).json({ error: 'Укажите название позиции' });

    const vacancyTypeEnum = type === 'PRACTICE' ? 'PRACTICE' : type === 'FOR_GRADUATES' ? 'FOR_GRADUATES' : type === 'JUNIOR' ? 'JUNIOR' : 'INTERNSHIP';

    const vacancy = await prisma.vacancy.create({
      data: {
        employerId: employer.id,
        title: title.trim(),
        salary: salary || 'По результатам собеседования',
        type: vacancyTypeEnum,
        description: description || 'Стажировка в партнерской компании Санкт-Петербурга',
        requirements: Array.isArray(requirements) ? requirements : ['Коммуникабельность', 'Базовые навыки']
      }
    });

    res.status(201).json({ success: true, vacancy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Изменение статуса отклика (пригласить на интервью и т.д.)
app.post('/api/employer/applications/:applicationId/status', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const { applicationId } = req.params;
    const { status } = req.body; // 'INVITED' | 'ACCEPTED' | 'REJECTED' | 'REVIEWING'

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: status || 'INVITED'
      }
    });

    res.json({ success: true, application: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 10. ИИ-АССИСТЕНТ (ПАМЯТЬ, СОХРАНЕНИЕ В БД И РЕКОМЕНДАЦИИ)
// ==========================================

/**
 * Вспомогательная функция для извлечения фактов (интересы, навыки, предпочтения)
 */
function extractFactsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();
  const facts = [];

  // Интересы (Interests)
  if (lower.includes('рисов') || lower.includes('арт') || lower.includes('иллюстрац') || lower.includes('персонаж') || lower.includes('худож')) {
    facts.push({ category: 'interest', fact: 'Любит рисовать и создавать визуальные образы/персонажей', importance: 2 });
  }
  if (lower.includes('программир') || lower.includes('код') || lower.includes('кодить') || lower.includes('разработк') || lower.includes('веб') || lower.includes('сайт')) {
    facts.push({ category: 'interest', fact: 'Интересуется веб-разработкой и программированием', importance: 2 });
  }
  if (lower.includes('данны') || lower.includes('нейросет') || lower.includes('ии') || lower.includes('ml') || lower.includes('машинн') || lower.includes('data science')) {
    facts.push({ category: 'interest', fact: 'Интересуется анализом данных и искусственным интеллектом', importance: 2 });
  }
  if (lower.includes('3d') || lower.includes('моделирован') || lower.includes('робот') || lower.includes('чертеж') || lower.includes('чпу') || lower.includes('желез')) {
    facts.push({ category: 'interest', fact: 'Увлекается 3D-моделированием, инженерией и робототехникой', importance: 2 });
  }
  if (lower.includes('дизайн') || lower.includes('интерфейс') || lower.includes('ux') || lower.includes('ui') || lower.includes('типографик')) {
    facts.push({ category: 'interest', fact: 'Интересуется UI/UX-дизайном и проектированием интерфейсов', importance: 2 });
  }
  if (lower.includes('биолог') || lower.includes('медицин') || lower.includes('генет') || lower.includes('врач') || lower.includes('лаборатор') || lower.includes('пцр')) {
    facts.push({ category: 'interest', fact: 'Интересуется биомедициной, биологией и лабораторными исследованиями', importance: 2 });
  }
  if (lower.includes('бизнес') || lower.includes('стартап') || lower.includes('проект') || lower.includes('менеджмент') || lower.includes('предприним') || lower.includes('питч')) {
    facts.push({ category: 'interest', fact: 'Проявляет интерес к предпринимательству и управлению проектами', importance: 2 });
  }

  // Навыки и инструменты (Skills)
  if (lower.includes('photoshop') || lower.includes('фотошоп')) {
    facts.push({ category: 'skill', fact: 'Навык работы в Adobe Photoshop', importance: 2 });
  }
  if (lower.includes('figma') || lower.includes('фигм')) {
    facts.push({ category: 'skill', fact: 'Навык прототипирования в Figma', importance: 2 });
  }
  if (lower.includes('react') || lower.includes('реакт') || lower.includes('javascript') || lower.includes('js')) {
    facts.push({ category: 'skill', fact: 'Знакомство с JavaScript и React', importance: 2 });
  }
  if (lower.includes('python') || lower.includes('питон') || lower.includes('пайтон')) {
    facts.push({ category: 'skill', fact: 'Опыт программирования на Python', importance: 2 });
  }
  if (lower.includes('компас') || lower.includes('autocad') || lower.includes('blender') || lower.includes('блендер')) {
    facts.push({ category: 'skill', fact: 'Опыт работы с 3D-редакторами и CAD-системами', importance: 2 });
  }

  // Предпочтения (Preferences)
  if (lower.includes('творческ') || lower.includes('креатив')) {
    facts.push({ category: 'preference', fact: 'Предпочитает творческие и нестандартные задачи', importance: 1 });
  }
  if (lower.includes('команд') || lower.includes('вместе') || lower.includes('людьми') || lower.includes('общени')) {
    facts.push({ category: 'preference', fact: 'Предпочитает командную работу и общение', importance: 1 });
  }
  if (lower.includes('самостоят') || lower.includes('один') || lower.includes('тишин') || lower.includes('сосредоточен')) {
    facts.push({ category: 'preference', fact: 'Предпочитает индивидуальную сосредоточенную работу', importance: 1 });
  }

  return facts;
}

/**
 * Поиск подходящей профессиональной пробы из БД
 */
function findMatchingTrial(text, aiAnswer, trials) {
  const combined = `${text} ${aiAnswer}`.toLowerCase();
  let bestTrial = null;
  let highestScore = 0;

  for (const trial of trials) {
    let score = 0;
    const trialTitle = (trial.title || '').toLowerCase();
    const trialDesc = (trial.description || '').toLowerCase();
    const trialTags = (trial.tags || []).map(t => t.toLowerCase());

    if (combined.includes(trialTitle)) score += 10;
    for (const tag of trialTags) {
      if (combined.includes(tag)) score += 3;
    }
    
    // Специальные соответствия тематикам
    if (trial.id === 't-des-1' && (combined.includes('дизайн') || combined.includes('рисова') || combined.includes('figma') || combined.includes('ux') || combined.includes('ui') || combined.includes('photoshop') || combined.includes('арт'))) {
      score += 6;
    }
    if (trial.id === 't-it-1' && (combined.includes('react') || combined.includes('frontend') || combined.includes('веб') || combined.includes('сайт') || combined.includes('javascript') || combined.includes('программир'))) {
      score += 6;
    }
    if (trial.id === 't-it-2' && (combined.includes('data') || combined.includes('python') || combined.includes('аналит') || combined.includes('нейро') || combined.includes('ml') || combined.includes('ии'))) {
      score += 6;
    }
    if (trial.id === 't-eng-1' && (combined.includes('3d') || combined.includes('чпу') || combined.includes('печать') || combined.includes('инженер') || combined.includes('робот') || combined.includes('компас'))) {
      score += 6;
    }
    if (trial.id === 't-med-1' && (combined.includes('био') || combined.includes('мед') || combined.includes('днк') || combined.includes('генет') || combined.includes('лаборатор'))) {
      score += 6;
    }
    if (trial.id === 't-biz-1' && (combined.includes('стартап') || combined.includes('бизнес') || combined.includes('питч') || combined.includes('менедж') || combined.includes('предприним'))) {
      score += 6;
    }

    if (score > highestScore) {
      highestScore = score;
      bestTrial = trial;
    }
  }

  return highestScore >= 3 ? bestTrial : null;
}

// 10.1. Отправка сообщения в чат с ИИ
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, scenario = 'A', stage = 'interests' } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    let sessionId = req.body.sessionId;
    let session = null;

    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }
    if (!session) {
      // Ищем последнюю активную сессию студента или создаем новую
      session = await prisma.chatSession.findFirst({
        where: { studentId: student.id },
        orderBy: { updatedAt: 'desc' },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });

      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            studentId: student.id,
            scenario: scenario === 'B' ? 'B' : scenario === 'C' ? 'C' : 'A',
            currentStage: stage
          },
          include: { messages: true }
        });
      }
      sessionId = session.id;
    }

    // Сохраняем сообщение пользователя в БД
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        userId: student.userId,
        role: 'user',
        content: message
      }
    });

    // ----------------------------------------------------
    // Извлечение и сохранение фактов (AIUserFact)
    // ----------------------------------------------------
    const extracted = extractFactsFromText(message);
    for (const item of extracted) {
      const existingFact = await prisma.aIUserFact.findFirst({
        where: {
          studentId: student.id,
          category: item.category,
          fact: { contains: item.fact.substring(0, 15) }
        }
      });
      if (!existingFact) {
        await prisma.aIUserFact.create({
          data: {
            studentId: student.id,
            category: item.category,
            fact: item.fact,
            importance: item.importance,
            source: 'чат с ИИ'
          }
        });
      }
    }

    // Загружаем память ИИ (AIUserFact) и список реальных профпроб (ProTrial)
    const existingFacts = await prisma.aIUserFact.findMany({
      where: { studentId: student.id },
      orderBy: { importance: 'desc' }
    });

    const availableTrials = await prisma.proTrial.findMany({
      include: {
        employer: true,
        zone: true
      }
    });

    const factsSummary = existingFacts.length > 0
      ? existingFacts.map(f => `• [${f.category}] ${f.fact}`).join('\n')
      : 'Факты о пользователе пока не накоплены.';

    const trialsSummary = availableTrials.map(t => 
      `• "${t.title}" (ID: ${t.id}, Направление: ${t.zone?.name || 'АИТУ'}, Свободно мест: ${t.availableSlots}, Организатор: ${t.employer?.companyName || 'АИТУ'})`
    ).join('\n');

    // Формируем системный промпт с учетом памяти ИИ и доступных проб
    const systemPrompt = `Ты — ИИ-ассистент Карьерного Навигатора СПб. Помогаешь школьникам и абитуриентам выбрать профессию в Санкт-Петербурге.
Сценарий: ${scenario}, Этап: ${stage}.

Память ИИ о школьнике:
${factsSummary}

Доступные реальные профпробы в каталоге АИТУ:
${trialsSummary}

Инструкции:
1. Отвечай дружелюбно, структурированно, емко на русском языке.
2. Учитывай известные факты об интересах и навыках школьника.
3. Если школьник рассказывает о своих интересах или спрашивает совета, порекомендуй подходящую реальную профпробу из каталога выше, упомянув её точное название.
4. Задавай вовлекающие вопросы для продолжения профориентации.`;

    let aiAnswer = '';
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiAnswer = data?.message?.content || '';
      }
    } catch (ollamaErr) {
      console.warn('Ollama not reachable, using fallback intelligent response:', ollamaErr.message);
    }

    // Fallback-логика с учетом ключевых слов и базы профпроб
    if (!aiAnswer) {
      const lower = message.toLowerCase();
      if (lower.includes('рисов') || lower.includes('дизайн') || lower.includes('figma') || lower.includes('photoshop') || lower.includes('арт')) {
        aiAnswer = 'Замечательно! У тебя отличная база для креативных индустрий. На основе твоих навыков рекомендую профессиональную пробу «Создание бренда и UI-кита сервиса» в лаборатории АИТУ. На ней ты сможешь поработать над реальным кейсом и собрать прототип в Figma!';
      } else if (lower.includes('react') || lower.includes('веб') || lower.includes('программир') || lower.includes('код') || lower.includes('сайт')) {
        aiAnswer = 'Отличный выбор! Веб-разработка сейчас на пике востребованности. Рекомендую очную пробу «Разработка веб-приложения на React» в АИТУ СПб (м. Технологический институт). Хочешь записаться?';
      } else if (lower.includes('python') || lower.includes('data') || lower.includes('нейросет') || lower.includes('ml')) {
        aiAnswer = 'Здорово! В аналитике данных и машинном обучении большой потенциал. Тебе отлично подойдет практикум «Аналитика данных и Обучение ML-модели» в АИТУ СПб.';
      } else if (lower.includes('3d') || lower.includes('моделирован') || lower.includes('чпу') || lower.includes('робот')) {
        aiAnswer = 'Прекрасно! Инженерное направление очень востребовано. Попробуй очный практикум «3D-моделирование и печать деталей на ЧПУ» в Инженерном корпусе АИТУ.';
      } else if (lower.includes('сценар')) {
        aiAnswer = 'В Карьерном Навигаторе действуют 3 сценария: Сценарий А (первичное самоопределение), Сценарий Б (погружение в IT и инженерию) и Сценарий В (подготовка к стажировкам и работе с партнерами).';
      } else {
        aiAnswer = `Спасибо за ваш вопрос! Основываясь на анализе ваших склонностей и текущем этапе (${stage}), рекомендую ознакомиться с практическими профпробами в кластерах АИТУ. Расскажите подробнее о ваших любимых предметах или хобби!`;
      }
    }

    // Сохраняем ответ ассистента в БД
    if (session) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: aiAnswer
        }
      });
    }

    // ----------------------------------------------------
    // Создание / связывание рекомендации (AIRecommendation -> ProTrial)
    // ----------------------------------------------------
    let matchedTrial = findMatchingTrial(message, aiAnswer, availableTrials);
    let recommendation = null;

    // Проверяем, не записан ли уже студент на эту пробу
    const alreadyBooked = matchedTrial
      ? await prisma.trialBooking.findFirst({
          where: {
            studentId: student.id,
            trialId: matchedTrial.id
          }
        })
      : null;

    if (matchedTrial && !alreadyBooked) {
      const existingRec = await prisma.aIRecommendation.findFirst({
        where: {
          studentId: student.id,
          relatedTrialId: matchedTrial.id,
          status: 'ACTIVE'
        },
        include: {
          relatedTrial: {
            include: { employer: true, zone: true }
          }
        }
      });

      if (existingRec) {
        recommendation = existingRec;
      } else {
        recommendation = await prisma.aIRecommendation.create({
          data: {
            studentId: student.id,
            type: 'TRIAL',
            title: `Рекомендация профпробы: ${matchedTrial.title}`,
            text: `По твоим интересам и навыкам ИИ-ассистент рекомендует попробовать пробу «${matchedTrial.title}» в АИТУ.`,
            relatedTrialId: matchedTrial.id,
            status: 'ACTIVE'
          },
          include: {
            relatedTrial: {
              include: { employer: true, zone: true }
            }
          }
        });
      }
    }

    // Получаем обновленный список фактов памяти
    const updatedFacts = await prisma.aIUserFact.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      answer: aiAnswer,
      scenario,
      stage,
      sessionId,
      facts: updatedFacts,
      recommendation
    });
  } catch (error) {
    console.error('Error in /api/assistant/chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10.2. Получение истории сообщений текущей или активной сессии
app.get('/api/assistant/history', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const { sessionId } = req.query;
    let session = null;

    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } }
        }
      });
    }

    if (!session) {
      session = await prisma.chatSession.findFirst({
        where: { studentId: student.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { orderBy: { createdAt: 'asc' } }
        }
      });
    }

    const facts = await prisma.aIUserFact.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    // Находим все записи ученика на пробы, чтобы не рекомендовать их повторно
    const bookedTrials = await prisma.trialBooking.findMany({
      where: { studentId: student.id },
      select: { trialId: true }
    });
    const bookedTrialIds = new Set(bookedTrials.map(b => b.trialId));

    const activeRecs = await prisma.aIRecommendation.findMany({
      where: { studentId: student.id, status: 'ACTIVE' },
      include: {
        relatedTrial: {
          include: { employer: true, zone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const recommendations = activeRecs.filter(r => !r.relatedTrialId || !bookedTrialIds.has(r.relatedTrialId));

    res.json({
      session,
      messages: session ? session.messages : [],
      facts,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10.3. Получение всех фактов памяти ИИ (AIUserFact)
app.get('/api/assistant/facts', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const facts = await prisma.aIUserFact.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ facts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10.4. Добавление факта в память ИИ
app.post('/api/assistant/facts', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const { category = 'interest', fact, importance = 1, source = 'ручной ввод' } = req.body;
    if (!fact) {
      return res.status(400).json({ error: 'Поле fact обязательно' });
    }

    const newFact = await prisma.aIUserFact.create({
      data: {
        studentId: student.id,
        category,
        fact,
        importance,
        source
      }
    });

    res.json({ success: true, fact: newFact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10.5. Удаление факта из памяти ИИ
app.delete('/api/assistant/facts/:id', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }

    const { id } = req.params;
    await prisma.aIUserFact.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Факт удален из памяти ИИ' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10.6. Получение рекомендаций ИИ (AIRecommendation с relatedTrial)
app.get('/api/assistant/recommendations', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const recommendations = await prisma.aIRecommendation.findMany({
      where: {
        studentId: student.id,
        status: 'ACTIVE'
      },
      include: {
        relatedTrial: {
          include: { employer: true, zone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10.7. Отклонение/закрытие рекомендации
app.post('/api/assistant/recommendations/:id/dismiss', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }

    const { id } = req.params;
    const updated = await prisma.aIRecommendation.update({
      where: { id },
      data: { status: 'DISMISSED' }
    });
    res.json({ success: true, recommendation: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// СТАРТ СЕРВЕРА
// ==========================================

app.listen(PORT, () => {
  console.log(`🚀 Career Navigator Server running on http://localhost:${PORT}`);
  console.log(`📊 Connected to PostgreSQL via Prisma ORM`);
});
