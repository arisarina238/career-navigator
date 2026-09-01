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
const FASTAPI_URL = (process.env.FASTAPI_URL || 'http://localhost:8000').replace(/\/$/, '');
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const AI_MODEL = process.env.AI_MODEL || 'qwen2.5:7b';

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

// Helper: Очистка ответов ИИ от CJK-иероглифов, Markdown-звездочек (*, **, #) и лишних спецсимволов
function sanitizeAiResponse(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // 1. CJK диапазон (китайские, японские, корейские иероглифы)
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf\uF900-\uFAFF]/g, '')
    // 2. Markdown жирный/курсив (**слово**, *слово*, ***слово***)
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    // 3. Одиночные звездочки и бэктики
    .replace(/[*`]/g, '')
    // 4. Markdown заголовки (### Заголовок -> Заголовок)
    .replace(/^[ \t]*#{1,6}[ \t]*/gm, '')
    // 5. Замена маркеров списков на аккуратный маркер
    .replace(/^[ \t]*[\*\-][ \t]+/gm, '• ')
    // 6. Нормализация переносов строк
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Helper: Обогащение результатов диагностики для учеников и родителей
function formatEnrichedDiagnostic(result) {
  if (!result) return null;
  const rawStrengths = result.strengths || [];
  
  let strengths = [];
  if (Array.isArray(rawStrengths) && rawStrengths.length > 0 && typeof rawStrengths[0] === 'object' && rawStrengths[0].title) {
    strengths = rawStrengths;
  } else {
    strengths = [
      {
        title: 'Аналитическое и алгоритмическое мышление',
        score: '94%',
        description: 'Умение быстро декомпозировать сложные комплексные задачи на понятные алгоритмические блоки и находить логические связи.',
        example: 'Легко разбирается в структуре кода, таблицах данных и архитектуре интерактивных приложений.'
      },
      {
        title: 'Практико-ориентированное техническое восприятие',
        score: '87%',
        description: 'Высокая тяга к осязаемым результатам: прототипированию, созданию работающих программных модулей или 3D-моделей.',
        example: 'Наибольшую концентрацию и вовлеченность проявляет на очных практикумах и в лабораториях.'
      },
      {
        title: 'Цифровая обучаемость и адаптивность',
        score: '90%',
        description: 'Самостоятельный интерес к освоению профессионального софта и современных сред разработки.',
        example: 'Уверенно ориентируется в интерфейсах редакторов кода, средах проектирования и онлайн-платформах.'
      }
    ];
  }

  const growthAreas = [
    {
      title: 'Усидчивость при выполнении рутинных монотонных задач',
      level: 'Рекомендуется мягкая поддержка',
      description: 'При длительной однообразной работе без видимого быстрого прогресса может временно снижаться темп и вовлеченность.',
      recommendation: 'Использовать метод коротких спринтов (25 минут работы / 5 минут паузы) и визуализировать каждый сделанный шаг.'
    },
    {
      title: 'Публичная презентация и защита проектов перед незнакомой аудиторией',
      level: 'Зона активного развития',
      description: 'Склонность глубже фокусироваться на технической реализации продукта, чем на его яркой презентации и ораторском питчинге.',
      recommendation: 'Практиковать домашние мини-презентации своих проектов родителям и участвовать в дружеских хакатонах СПб.'
    },
    {
      title: 'Управление дедлайнами и перфекционизм в деталях',
      level: 'Точка внимания',
      description: 'Стремление сразу довести чертеж или программный код до идеала иногда затягивает сроки сдачи начального этапа.',
      recommendation: 'Обучение принципу создания первого рабочего прототипа (MVP) с последующей постепенной доработкой.'
    }
  ];

  const parentActionPlan = [
    {
      stage: '1. Домашняя поддержка',
      title: 'Доверительные беседы об интересах',
      description: 'Обсуждайте с ребёнком не оценки, а то, какие реальные задачи и технологии его вдохновляют.',
      practicalTip: 'Спросите: «Какой сервис или приложение ты хотел бы придумать и разработать для нашего города?»'
    },
    {
      stage: '2. Пространство для проб',
      title: 'Посещение лабораторий АИТУ и открытых мастер-классов СПб',
      description: 'Очные профориентационные пробы помогают подтвердить интерес на практике до поступления в ВУЗ или колледж.',
      practicalTip: 'Подтвердите электронное согласие в семейном кабинете на ближайшую пробу по веб-разработке или 3D-печати.'
    },
    {
      stage: '3. Траектория образования',
      title: 'Выбор профильных кружков и образовательного трека',
      description: 'Рассмотрите центры цифрового образования («IT-куб», «Кванториум», Академия цифровых технологий СПб) и программы СПО/ВУЗов.',
      practicalTip: 'Ориентируйтесь на целевые стажировки у партнеров Санкт-Петербурга (VK, Газпром Нефть, Силовые Машины).'
    }
  ];

  return {
    id: result.id,
    date: result.completedAt ? (typeof result.completedAt === 'string' ? result.completedAt.split('T')[0] : result.completedAt.toISOString().split('T')[0]) : '2026-08-01',
    topDirections: result.topDirections,
    scoresDistribution: result.scoresDistribution,
    strengths,
    growthAreas,
    parentActionPlan,
    confidenceScore: result.confidenceScore || 92
  };
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
// 3. АДАПТИВНАЯ ИИ-ДИАГНОСТИКА (RIASEC + ДОМЕНЫ КОМПЕТЕНЦИЙ)
// ==========================================

const ADAPTIVE_QUESTION_BANK = [
  {
    id: 'q-base-1',
    category: 'Базовые профессиональные интересы',
    difficulty: 1,
    questionText: 'Какая практическая деятельность увлекает вас больше всего?',
    options: [
      { id: 'opt-1-1', text: 'Программирование, разработка алгоритмов и создание веб-сервисов', scores: { it: 5, engineering: 2 } },
      { id: 'opt-1-2', text: 'Инженерное 3D-моделирование, сборка механизмов и работа со станками', scores: { engineering: 5, it: 2 } },
      { id: 'opt-1-3', text: 'Дизайн интерфейсов, графический арт, анимация и визуализация', scores: { design: 5, it: 2 } },
      { id: 'opt-1-4', text: 'Биологические и химические исследования, генетика и медицина', scores: { medicine: 5 } },
      { id: 'opt-1-5', text: 'Управление проектами, запуск стартапов, экономика и маркетинг', scores: { biz: 5 } }
    ]
  },
  {
    id: 'q-base-2',
    category: 'Тип аналитического мышления',
    difficulty: 1,
    questionText: 'Как вам комфортнее всего находить решение сложной нестандартной задачи?',
    options: [
      { id: 'opt-2-1', text: 'Через логику, математические формулы, структуры данных и код', scores: { it: 4, biz: 2 } },
      { id: 'opt-2-2', text: 'Через наглядные схемы, прототипы в CAD и тестирование руками', scores: { engineering: 4, medicine: 2 } },
      { id: 'opt-2-3', text: 'Через визуальную композицию, эстетику и пользовательские сценарии', scores: { design: 5 } },
      { id: 'opt-2-4', text: 'Через проведение лабораторных экспериментов и анализ проб', scores: { medicine: 5 } },
      { id: 'opt-2-5', text: 'Через мозговой штурм с командой и оценку выгоды решения', scores: { biz: 4, design: 2 } }
    ]
  },
  {
    id: 'q-base-3',
    category: 'Рабочая среда и формат вовлеченности',
    difficulty: 1,
    questionText: 'В каком формате работы вы чувствуете себя наиболее продуктивно?',
    options: [
      { id: 'opt-3-1', text: 'Глубокое индивидуальное погружение в код или аналитический отчет', scores: { it: 4, engineering: 2 } },
      { id: 'opt-3-2', text: 'Практическая работа в технической мастерской с реальным оборудованием', scores: { engineering: 5, medicine: 3 } },
      { id: 'opt-3-3', text: 'Творческая дизайн-студия, поиск свежих визуальных концепций', scores: { design: 4, biz: 2 } },
      { id: 'opt-3-4', text: 'Динамичный командный проект со спринтами, дедлайнами и защитой', scores: { biz: 5, it: 2 } }
    ]
  },
  {
    id: 'q-disc-it-eng',
    category: 'IT vs Инженерия',
    difficulty: 2,
    discriminates: ['it', 'engineering'],
    questionText: 'При создании нового беспилотного дрона, какую задачу вы бы выбрали?',
    options: [
      { id: 'opt-4-1', text: 'Писать нейросетевой автопилот, компьютерное зрение и сервер управления', scores: { it: 5, engineering: 1 } },
      { id: 'opt-4-2', text: 'Проектировать аэродинамический корпус в CAD, печатать узлы и собирать плату', scores: { engineering: 5, it: 1 } }
    ]
  },
  {
    id: 'q-disc-it-des',
    category: 'IT vs Креативный Дизайн',
    difficulty: 2,
    discriminates: ['it', 'design'],
    questionText: 'При создании нового мобильного приложения для школьников Петербурга, что для вас важнее?',
    options: [
      { id: 'opt-5-1', text: 'Архитектура баз данных, безопасность API и быстрая логика на React/TypeScript', scores: { it: 5, design: 1 } },
      { id: 'opt-5-2', text: 'Удобство пользовательских сценариев (UX), анимации и стильный UI-кит в Figma', scores: { design: 5, it: 1 } }
    ]
  },
  {
    id: 'q-disc-eng-med',
    category: 'Инженерия vs Биомедицина',
    difficulty: 2,
    discriminates: ['engineering', 'medicine'],
    questionText: 'Какое наукоемкое направление вам ближе?',
    options: [
      { id: 'opt-6-1', text: 'Разработка бионических протезов, медицинских датчиков и микромеханики', scores: { engineering: 4, medicine: 4 } },
      { id: 'opt-6-2', text: 'Исследование структуры ДНК, микробиология, создание лекарственных препаратов', scores: { medicine: 5, engineering: 1 } },
      { id: 'opt-6-3', text: 'Станкостроение, тяжелые турбины и промышленная робототехника', scores: { engineering: 5 } }
    ]
  },
  {
    id: 'q-disc-biz-it',
    category: 'Менеджмент vs Разработка',
    difficulty: 2,
    discriminates: ['biz', 'it'],
    questionText: 'В технологическом стартапе какую роль вы видите для себя идеальной?',
    options: [
      { id: 'opt-7-1', text: 'Product Owner: стратегия продукта, юнит-экономика, переговоры с инвесторами', scores: { biz: 5, it: 2 } },
      { id: 'opt-7-2', text: 'Tech Lead: архитектура системы, написание ключевых сервисов, код-ревью', scores: { it: 5, biz: 1 } }
    ]
  },
  {
    id: 'q-disc-des-biz',
    category: 'Дизайн vs Предпринимательство',
    difficulty: 2,
    discriminates: ['design', 'biz'],
    questionText: 'При запуске нового бренда молодежной одежды или мерча, что вы сделаете в первую очередь?',
    options: [
      { id: 'opt-8-1', text: 'Разработаю фирменный стиль, 3D-модели одежды, визуал и эстетику коллекции', scores: { design: 5, biz: 1 } },
      { id: 'opt-8-2', text: 'Просчитаю себестоимость, найду поставщиков в СПб, настрою каналы продаж', scores: { biz: 5, design: 1 } }
    ]
  },
  {
    id: 'q-deep-it',
    category: 'Специализация в IT',
    difficulty: 3,
    domain: 'it',
    questionText: 'Какое направление в IT вам хотелось бы освоить на профессиональном уровне?',
    options: [
      { id: 'opt-9-1', text: 'Frontend & Full-Stack разработка (React, Node.js, интерактивные веб-сервисы)', scores: { it: 5, design: 2 } },
      { id: 'opt-9-2', text: 'Искусственный интеллект и Big Data (Python, нейросети, машинное обучение)', scores: { it: 5, engineering: 2 } },
      { id: 'opt-9-3', text: 'Информационная безопасность и администрирование высоконагруженных сетей', scores: { it: 5, biz: 1 } }
    ]
  },
  {
    id: 'q-deep-eng',
    category: 'Специализация в Инженерии',
    difficulty: 3,
    domain: 'engineering',
    questionText: 'С каким оборудованием в лаборатории АИТУ вам интереснее всего работать?',
    options: [
      { id: 'opt-10-1', text: 'Станки с ЧПУ, лазерные резаки и 3D-принтеры точного позиционирования', scores: { engineering: 5 } },
      { id: 'opt-10-2', text: 'Микроконтроллеры (Arduino/STM32), сенсоры и управляющие платы роботов', scores: { engineering: 4, it: 3 } },
      { id: 'opt-10-3', text: 'САПР-системы проектирования сложных механизмов (Компас-3D / AutoCAD)', scores: { engineering: 5, design: 2 } }
    ]
  },
  {
    id: 'q-deep-des',
    category: 'Специализация в Дизайне',
    difficulty: 3,
    domain: 'design',
    questionText: 'В какой сфере цифрового дизайна вам хотелось бы построить портфолио?',
    options: [
      { id: 'opt-11-1', text: 'UI/UX дизайн мобильных приложений и сложных корпоративных интерфейсов', scores: { design: 5, it: 2 } },
      { id: 'opt-11-2', text: '3D-графика, рендеринг персонажей и анимация для игровой индустрии', scores: { design: 5, engineering: 2 } },
      { id: 'opt-11-3', text: 'Брендинг, айдентика и визуальные коммуникации для крупных компаний', scores: { design: 5, biz: 2 } }
    ]
  },
  {
    id: 'q-deep-med',
    category: 'Специализация в Биомедицине',
    difficulty: 3,
    domain: 'medicine',
    questionText: 'Какая область естественных наук вас вдохновляет?',
    options: [
      { id: 'opt-12-1', text: 'Генная инженерия и биотехнологии (Biocad, биопрепараты)', scores: { medicine: 5, it: 2 } },
      { id: 'opt-12-2', text: 'Медицинская диагностика, клиническая биохимия и лабораторные тесты', scores: { medicine: 5 } },
      { id: 'opt-12-3', text: 'Экологический мониторинг водной среды и биоресурсов Санкт-Петербурга', scores: { medicine: 4, engineering: 2 } }
    ]
  }
];

app.get('/api/diagnostics/questions', async (req, res) => {
  try {
    let questions = await prisma.diagnosticQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: { options: true }
    });

    if (!questions || questions.length === 0) {
      return res.json(ADAPTIVE_QUESTION_BANK.map(q => ({
        id: q.id,
        category: q.category,
        question: q.questionText,
        options: q.options
      })));
    }

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
    res.json(ADAPTIVE_QUESTION_BANK.map(q => ({
      id: q.id,
      category: q.category,
      question: q.questionText,
      options: q.options
    })));
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
      return res.json(null);
    }

    res.json(formatEnrichedDiagnostic(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Адаптивный шаг диагностики (АДАПТИВНЫЙ ТЕСТ)
app.post('/api/diagnostics/adaptive-step', async (req, res) => {
  try {
    const { history = [] } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    // 1. Агрегация баллов по доменам
    const scores = { it: 0, engineering: 0, design: 0, biz: 0, medicine: 0 };
    const answeredQuestionIds = new Set(history.map(h => h.questionId));

    history.forEach((h) => {
      if (h.scores && typeof h.scores === 'object') {
        Object.entries(h.scores).forEach(([k, v]) => {
          if (scores[k] !== undefined) {
            scores[k] += Number(v) || 0;
          }
        });
      }
    });

    const answeredCount = history.length;
    const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

    // Сортировка доменов по баллам
    const sortedDomains = Object.entries(scores)
      .map(([key, val]) => ({ key, val, pct: Math.round((val / totalPoints) * 100) }))
      .sort((a, b) => b.val - a.val);

    const top1 = sortedDomains[0];
    const top2 = sortedDomains[1];
    const scoreGap = top1.val - top2.val;
    const deltaRatio = (top1.val + top2.val) > 0 ? scoreGap / (top1.val + top2.val) : 0;

    // Расчет Confidence Score (уверенности модели)
    const confidenceScore = Math.min(100, Math.round((answeredCount / 6) * 35 + (deltaRatio * 65)));

    // Условия завершения:
    // 1) отвечено >= 5 вопросов И уверенность >= 85%
    // 2) отвечено >= 10 вопросов (максимальный порог)
    const isComplete = (answeredCount >= 5 && confidenceScore >= 85) || answeredCount >= 10;

    if (isComplete && answeredCount > 0) {
      const itPct = Math.min(100, Math.max(15, Math.round(((scores.it || 0) / totalPoints) * 100))) || 92;
      const engPct = Math.min(100, Math.max(15, Math.round(((scores.engineering || 0) / totalPoints) * 100))) || 85;
      const desPct = Math.min(100, Math.max(15, Math.round(((scores.design || 0) / totalPoints) * 100))) || 74;
      const bizPct = Math.min(100, Math.max(15, Math.round(((scores.biz || 0) / totalPoints) * 100))) || 60;
      const medPct = Math.min(100, Math.max(15, Math.round(((scores.medicine || 0) / totalPoints) * 100))) || 45;

      const domainNames = {
        it: { name: 'IT & Разработка цифровых сервисов', category: 'IT', desc: 'Высокий потенциал в алгоритмизации, веб-технологиях и архитектуре приложений' },
        engineering: { name: 'Инженер по 3D, CAD и ЧПУ технологиям', category: 'Инженерия', desc: 'Отличные пространственные способности, системное конструирование' },
        design: { name: 'UI/UX Продуктовый Дизайнер', category: 'Дизайн', desc: 'Проектирование пользовательских сценариев и современных цифровых интерфейсов' },
        biz: { name: 'Технологический Менеджмент & Стартапы', category: 'Бизнес', desc: 'Управление проектами, упаковка бизнес-моделей и координация команд' },
        medicine: { name: 'Биомедицина & Генетические исследования', category: 'Биомед', desc: 'Наукоемкие исследования в биотехнологиях и лабораторной диагностике' }
      };

      const topDirections = sortedDomains.slice(0, 3).map(d => ({
        name: domainNames[d.key]?.name || 'Цифровые технологии',
        match: Math.max(15, d.pct),
        category: domainNames[d.key]?.category || 'IT',
        desc: domainNames[d.key]?.desc || 'Профильное направление в кластерах Санкт-Петербурга'
      }));

      const scoresDistribution = [
        { label: 'IT & Программирование', percent: itPct, color: '#0284c7' },
        { label: 'Инженерия и CAD', percent: engPct, color: '#2563eb' },
        { label: 'Креативный Дизайн', percent: desPct, color: '#ec4899' },
        { label: 'Бизнес и Управление', percent: bizPct, color: '#f59e0b' },
        { label: 'Биомедицина & Лаборатория', percent: medPct, color: '#10b981' }
      ];

      const rawStrengths = [
        'Высокий уровень логико-алгоритмического анализа задач',
        'Практическая направленность и стремление к созданию работающего прототипа',
        'Быстрая обучаемость современным прикладным инструментам и софту'
      ];

      const result = await prisma.diagnosticResult.create({
        data: {
          studentId: student.id,
          topDirections,
          scoresDistribution,
          strengths: rawStrengths,
          rawAnswers: history
        }
      });

      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { progressPercent: Math.max(student.progressPercent || 0, 50) }
      });

      const enriched = formatEnrichedDiagnostic(result);

      return res.json({
        isComplete: true,
        confidenceScore,
        result: enriched
      });
    }

    // Подбор следующего оптимального вопроса адаптивного алгоритма
    let candidateNext = null;

    if (answeredCount < 3) {
      // Базовые ориентирующие вопросы
      candidateNext = ADAPTIVE_QUESTION_BANK.find(q => q.difficulty === 1 && !answeredQuestionIds.has(q.id));
    } else {
      // Дискриминант по пограничным шкалам
      if (deltaRatio < 0.25) {
        candidateNext = ADAPTIVE_QUESTION_BANK.find(q => 
          !answeredQuestionIds.has(q.id) &&
          q.discriminates &&
          q.discriminates.includes(top1.key) &&
          q.discriminates.includes(top2.key)
        );
      }
      // Углубление в лидирующий домен
      if (!candidateNext) {
        candidateNext = ADAPTIVE_QUESTION_BANK.find(q => 
          !answeredQuestionIds.has(q.id) &&
          q.domain === top1.key
        );
      }
      // Любой оставшийся дискриминант или вопрос
      if (!candidateNext) {
        candidateNext = ADAPTIVE_QUESTION_BANK.find(q => !answeredQuestionIds.has(q.id));
      }
    }

    if (!candidateNext) {
      candidateNext = ADAPTIVE_QUESTION_BANK[0];
    }

    return res.json({
      isComplete: false,
      step: answeredCount + 1,
      confidenceScore,
      question: {
        id: candidateNext.id,
        category: candidateNext.category,
        question: candidateNext.questionText,
        options: candidateNext.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          scores: opt.scores
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/diagnostics/submit', async (req, res) => {
  try {
    const { answers = [] } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const totalScores = { it: 0, engineering: 0, design: 0, medicine: 0, biz: 0 };
    if (Array.isArray(answers)) {
      for (const ans of answers) {
        if (ans.scores && typeof ans.scores === 'object') {
          for (const [key, val] of Object.entries(ans.scores)) {
            if (totalScores[key] !== undefined) {
              totalScores[key] += Number(val) || 0;
            }
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

    const result = await prisma.diagnosticResult.create({
      data: {
        studentId: student.id,
        topDirections,
        scoresDistribution,
        strengths: [
          'Аналитический склад ума и склонность к алгоритмизации',
          'Высокая усидчивость при работе с цифровыми массивами данных',
          'Интерес к современным веб-технологиям и языкам программирования'
        ],
        rawAnswers: answers
      }
    });

    await prisma.studentProfile.update({
      where: { id: student.id },
      data: { progressPercent: Math.max(student.progressPercent || 0, 45) }
    });

    res.json(formatEnrichedDiagnostic(result));
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
      diagnosticResult: formatEnrichedDiagnostic(c.diagnosticResults[0]),
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

// ----------------------------------------------------
// ЕДИНООБРАЗНЫЙ И ПОЛНЫЙ ФУНКЦИОНАЛ РАБОТОДАТЕЛЯ И КАНДИДАТОВ
// ----------------------------------------------------

// Получить профиль текущего работодателя
app.get('/api/employer/profile', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const emp = authUser.employerProfile;
    res.json({
      id: emp.id,
      companyName: emp.companyName,
      industry: emp.industry,
      address: emp.address,
      description: emp.description,
      logo: emp.logoUrl,
      verified: emp.verified,
      name: authUser.fullName,
      email: authUser.email,
      avatar: authUser.avatarUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить список откликов кандидатов на вакансии текущего работодателя
app.get('/api/employer/applicants', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const applications = await prisma.jobApplication.findMany({
      where: { vacancy: { employerId: authUser.employerProfile.id } },
      include: {
        student: { include: { user: true } },
        vacancy: true
      }
    });
    res.json(applications.map(app => ({
      id: app.id,
      candidateName: app.student.user.fullName,
      candidateSchool: app.student.school || 'ГБОУ СОШ СПб',
      vacancyTitle: app.vacancy.title,
      coverLetter: app.coverLetter || '',
      status: app.status,
      date: app.appliedAt ? app.appliedAt.toISOString().substring(0, 10) : ''
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все вакансии / стажировки текущего работодателя (включая черновики)
app.get('/api/employer/vacancies', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    const vacancies = await prisma.vacancy.findMany({
      where: { employerId: employer.id },
      include: {
        _count: {
          select: { applications: true, jobInvitations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      vacancies.map((v) => ({
        id: v.id,
        title: v.title,
        salary: v.salary,
        type: v.type,
        typeLabel: v.type === 'INTERNSHIP' ? 'Стажировка' : v.type === 'PRACTICE' ? 'Практика' : v.type === 'JUNIOR' ? 'Junior позиция' : 'Для выпускников',
        description: v.description,
        requirements: v.requirements,
        location: v.location || employer.address,
        isActive: v.isActive,
        isDraft: v.isDraft,
        statusLabel: v.isDraft ? 'Черновик' : v.isActive ? 'Опубликована' : 'В архиве',
        applicationsCount: v._count.applications,
        invitationsCount: v._count.jobInvitations,
        createdAt: v.createdAt.toISOString().split('T')[0]
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание вакансии / стажировки (Черновик или Публикация)
app.post('/api/employer/vacancies', async (req, res) => {
  try {
    const { title, salary, type, description, requirements, location, isDraft = false } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Укажите название позиции' });
    }

    const vacancyTypeEnum = type === 'PRACTICE' ? 'PRACTICE' : type === 'FOR_GRADUATES' ? 'FOR_GRADUATES' : type === 'JUNIOR' ? 'JUNIOR' : 'INTERNSHIP';
    const reqArray = Array.isArray(requirements)
      ? requirements.filter(Boolean)
      : typeof requirements === 'string'
      ? requirements.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Базовые профильные знания'];

    const vacancy = await prisma.vacancy.create({
      data: {
        employerId: employer.id,
        title: title.trim(),
        salary: salary || 'По результатам собеседования',
        type: vacancyTypeEnum,
        description: description || 'Описание позиций и задач стажера',
        requirements: reqArray.length > 0 ? reqArray : ['Готовность к обучению'],
        location: location || employer.address,
        isActive: !isDraft,
        isDraft: Boolean(isDraft)
      }
    });

    res.status(201).json({ success: true, vacancy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Редактирование вакансии / стажировки
app.put('/api/employer/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, salary, type, description, requirements, location, isDraft } = req.body;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    const existing = await prisma.vacancy.findUnique({ where: { id } });
    if (!existing || existing.employerId !== employer.id) {
      return res.status(404).json({ error: 'Вакансия не найдена или нет прав' });
    }

    const reqArray = Array.isArray(requirements)
      ? requirements.filter(Boolean)
      : typeof requirements === 'string'
      ? requirements.split(',').map((s) => s.trim()).filter(Boolean)
      : existing.requirements;

    const updated = await prisma.vacancy.update({
      where: { id },
      data: {
        title: title ? title.trim() : existing.title,
        salary: salary !== undefined ? salary : existing.salary,
        type: type ? (type === 'PRACTICE' ? 'PRACTICE' : type === 'FOR_GRADUATES' ? 'FOR_GRADUATES' : type === 'JUNIOR' ? 'JUNIOR' : 'INTERNSHIP') : existing.type,
        description: description !== undefined ? description : existing.description,
        requirements: reqArray,
        location: location !== undefined ? location : existing.location,
        isDraft: isDraft !== undefined ? Boolean(isDraft) : existing.isDraft,
        isActive: isDraft !== undefined ? !isDraft : existing.isActive
      }
    });

    res.json({ success: true, vacancy: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Переключение статуса публикации (Опубликовать / В архив / В черновики)
app.post('/api/employer/vacancies/:id/toggle-publish', async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    const existing = await prisma.vacancy.findUnique({ where: { id } });
    if (!existing || existing.employerId !== employer.id) {
      return res.status(404).json({ error: 'Вакансия не найдена' });
    }

    const nextIsActive = !existing.isActive;
    const updated = await prisma.vacancy.update({
      where: { id },
      data: {
        isActive: nextIsActive,
        isDraft: false
      }
    });

    res.json({ success: true, vacancy: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удаление вакансии
app.delete('/api/employer/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    const existing = await prisma.vacancy.findUnique({ where: { id } });
    if (!existing || existing.employerId !== employer.id) {
      return res.status(404).json({ error: 'Вакансия не найдена' });
    }

    await prisma.vacancy.delete({ where: { id } });
    res.json({ success: true, deletedId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Поиск и получение списка всех кандидатов (для приглашения работодателем)
app.get('/api/employer/candidates', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
        diagnosticResults: { orderBy: { completedAt: 'desc' }, take: 1 },
        trialBookings: { include: { trial: true } },
        jobInvitations: { where: { employerId: employer.id } },
        jobApplications: {
          where: { vacancy: { employerId: employer.id } },
          include: { vacancy: true }
        }
      }
    });

    res.json(
      students.map((st) => {
        const topDiag = st.diagnosticResults[0];
        const latestInvitation = st.jobInvitations[0];
        const latestApplication = st.jobApplications[0];

        return {
          id: st.id,
          userId: st.userId,
          name: st.user.fullName,
          avatar: st.user.avatarUrl,
          grade: st.grade || '9 класс',
          school: st.school || 'ГБОУ СОШ Санкт-Петербурга',
          topDirection: topDiag?.topDirections?.[0]?.name || 'Диагностика не пройдена',
          matchScore: topDiag?.topDirections?.[0]?.match || 90,
          category: topDiag?.topDirections?.[0]?.category || 'IT',
          strengths: topDiag?.strengths || ['Усидчивость', 'Логика'],
          trialBookingsCount: st.trialBookings.length,
          hasAttendedTrials: st.trialBookings.some((b) => b.status === 'ATTENDED'),
          invitationStatus: latestInvitation ? latestInvitation.status : null,
          invitationId: latestInvitation?.id || null,
          applicationStatus: latestApplication ? latestApplication.status : null,
          applicationPosition: latestApplication?.vacancy?.title || null
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отправка приглашения кандидату от работодателя (END-TO-END FLOW)
app.post('/api/employer/invitations', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;
    const { studentId, vacancyId, title, message, interviewDate } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Укажите кандидата для приглашения' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Кандидат не найден' });
    }

    let vacancyTitle = 'Приглашение на стажировку';
    if (vacancyId) {
      const vac = await prisma.vacancy.findUnique({ where: { id: vacancyId } });
      if (vac) vacancyTitle = vac.title;
    }

    const invitation = await prisma.jobInvitation.create({
      data: {
        employerId: employer.id,
        studentId: student.id,
        vacancyId: vacancyId || null,
        title: title || vacancyTitle,
        message: message || `Компания «${employer.companyName}» приглашает вас на прохождение собеседования/стажировки.`,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        status: 'PENDING'
      }
    });

    // СОЗДАЁМ РЕАЛЬНОЕ УВЕДОМЛЕНИЕ ДЛЯ КАНДИДАТА В БД!
    await prisma.notification.create({
      data: {
        userId: student.userId,
        type: 'INVITATION',
        title: `Приглашение от ${employer.companyName}`,
        message: `Вас приглашают на позицию «${invitation.title}». Нажмите, чтобы посмотреть детали и дать ответ.`,
        link: '/profile'
      }
    });

    res.status(201).json({ success: true, invitation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Список всех отправленных приглашений работодателя
app.get('/api/employer/invitations', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const employer = authUser.employerProfile;

    const invitations = await prisma.jobInvitation.findMany({
      where: { employerId: employer.id },
      include: {
        student: { include: { user: true } },
        vacancy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      invitations.map((inv) => ({
        id: inv.id,
        candidateName: inv.student.user.fullName,
        candidateAvatar: inv.student.user.avatarUrl,
        position: inv.title,
        message: inv.message,
        interviewDate: inv.interviewDate ? inv.interviewDate.toISOString().split('T')[0] : null,
        status: inv.status,
        statusLabel:
          inv.status === 'PENDING' ? 'Ожидает ответа' :
          inv.status === 'ACCEPTED' ? 'Принято' :
          inv.status === 'INTERVIEW_SCHEDULED' ? 'Интервью назначено' :
          inv.status === 'REJECTED' ? 'Отклонено' : 'Завершено',
        sentAt: inv.createdAt.toISOString().split('T')[0]
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Изменение статуса отклика работодателем + отправка уведомления кандидату
app.post('/api/employer/applications/:applicationId/status', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.employerProfile) {
      return res.status(401).json({ error: 'Требуется авторизация работодателя' });
    }
    const { applicationId } = req.params;
    const { status } = req.body; // 'INVITED' | 'ACCEPTED' | 'REJECTED' | 'REVIEWING'

    const appItem = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: { include: { employer: true } },
        student: true
      }
    });

    if (!appItem) return res.status(404).json({ error: 'Отклик не найден' });

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: status || 'INVITED'
      }
    });

    // Отправляем уведомление кандидату
    const statusText =
      status === 'INVITED' ? 'пригласил вас на интервью' :
      status === 'ACCEPTED' ? 'принял ваш отклик!' :
      status === 'REJECTED' ? 'отклонил отклик' : 'рассматривает ваш отклик';

    await prisma.notification.create({
      data: {
        userId: appItem.student.userId,
        type: 'APPLICATION_STATUS',
        title: `Статус отклика в ${appItem.vacancy.employer.companyName}`,
        message: `Работодатель ${statusText} на позицию «${appItem.vacancy.title}».`,
        link: '/profile'
      }
    });

    res.json({ success: true, application: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ПОЛУЧЕНИЕ И ОТВЕТ НА ПРИГЛАШЕНИЯ ДЛЯ КАНДИДАТА (STUDENT)
// ----------------------------------------------------

// Получить приглашения текущего студента
app.get('/api/student/invitations', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const invitations = await prisma.jobInvitation.findMany({
      where: { studentId: student.id },
      include: {
        employer: { include: { user: true } },
        vacancy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      invitations.map((inv) => ({
        id: inv.id,
        employerName: inv.employer.companyName,
        employerLogo: inv.employer.logoUrl,
        industry: inv.employer.industry,
        title: inv.title,
        message: inv.message,
        interviewDate: inv.interviewDate ? inv.interviewDate.toISOString().split('T')[0] : null,
        status: inv.status,
        statusLabel:
          inv.status === 'PENDING' ? 'Ожидает вашего ответа' :
          inv.status === 'ACCEPTED' ? 'Вы приняли приглашение' :
          inv.status === 'INTERVIEW_SCHEDULED' ? 'Интервью назначено' :
          inv.status === 'REJECTED' ? 'Отклонено вами' : 'Завершено',
        date: inv.createdAt.toISOString().split('T')[0]
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ответить на приглашение (Принять или Отклонить)
app.post('/api/student/invitations/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACCEPTED' | 'REJECTED'
    const authUser = await getAuthUser(req);
    if (!authUser || !authUser.studentProfile) {
      return res.status(401).json({ error: 'Требуется авторизация ученика' });
    }
    const student = authUser.studentProfile;

    const inv = await prisma.jobInvitation.findUnique({
      where: { id },
      include: {
        employer: { include: { user: true } },
        student: { include: { user: true } }
      }
    });

    if (!inv || inv.studentId !== student.id) {
      return res.status(404).json({ error: 'Приглашение не найдено' });
    }

    const nextStatus = status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED';
    const updated = await prisma.jobInvitation.update({
      where: { id },
      data: { status: nextStatus }
    });

    // Отправляем уведомление работодателю
    const actionText = nextStatus === 'ACCEPTED' ? 'принял ваше приглашение на интервью!' : 'отклонил приглашение.';
    await prisma.notification.create({
      data: {
        userId: inv.employer.userId,
        type: 'INVITATION_RESPONSE',
        title: `Ответ кандидата ${inv.student.user.fullName}`,
        message: `Кандидат ${inv.student.user.fullName} ${actionText}`,
        link: '/employer'
      }
    });

    res.json({ success: true, invitation: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// СИСТЕМА УВЕДОМЛЕНИЙ (NOTIFICATIONS)
// ----------------------------------------------------

// Получить список уведомлений пользователя
app.get('/api/notifications', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: authUser.id, isRead: false }
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Пометить одно уведомление прочитанным
app.post('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Требуется авторизация' });

    await prisma.notification.updateMany({
      where: { id, userId: authUser.id },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Пометить все уведомления прочитанными
app.post('/api/notifications/read-all', async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Требуется авторизация' });

    await prisma.notification.updateMany({
      where: { userId: authUser.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });
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

ЯЗЫКОВОЙ РЕЖИМ И ПРАВИЛА:
1. Отвечай ИСКЛЮЧИТЕЛЬНО на грамотном русском языке. Использование китайских иероглифов (CJK-символов) КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО.
2. ФОРМАТИРОВАНИЕ: ЗАПРЕЩЕНО использовать форматирование Markdown (символы *, **, _, #, списки со звёздочками). Ответ должен быть чистым Plain Text с аккуратными абзацами.
3. Отвечай дружелюбно, структурированно, ёмко, не используй сложную терминологию без объяснений.
4. Если школьник рассказывает об интересах или просит совета, порекомендуй подходящую реальную профпробу из каталога выше, упомянув её точное название.
5. Подводи ответ к логическому завершению: четко закончи мысль и предоставь содержательный результат. Не задавай в конце сообщения новых встречных вопросов — заверши ответ и жди, пока пользователь сам задаст следующий вопрос.`;

    let aiAnswer = '';

    // 1. Попытка запроса через специализированный FastAPI AI-микросервис (порт 8000)
    try {
      const historyList = (session?.messages || []).slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const fastApiResponse = await fetch(`${FASTAPI_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: historyList,
          scenario: scenario || 'A',
          stage: stage || 'interests'
        }),
        signal: AbortSignal.timeout(2000)
      });

      if (fastApiResponse.ok) {
        const fastApiData = await fastApiResponse.json();
        if (fastApiData && fastApiData.answer && fastApiData.answer.trim()) {
          aiAnswer = fastApiData.answer.trim();
          console.log(`[AI] Ответ успешно сгенерирован через FastAPI AI: ${aiAnswer.substring(0, 50)}...`);
        }
      }
    } catch (fastApiErr) {
      console.log('[AI] FastAPI сервис недоступен или вернул ошибку, переключение на прямой запрос к Ollama...');
    }

    // 2. Прямой запрос к Ollama (порт 11434), если FastAPI не ответил
    if (!aiAnswer) {
      try {
        let targetModel = process.env.AI_MODEL || AI_MODEL || 'qwen2.5:7b';
        
        // Динамическая проверка установленных моделей в Ollama
        const tagsRes = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
        if (tagsRes && tagsRes.ok) {
          const tagsData = await tagsRes.json();
          const availableModels = (tagsData.models || []).map(m => m.name);
          if (availableModels.length > 0) {
            // Если выбранная модель не установлена, выбираем лучшую доступную
            if (!availableModels.includes(targetModel) && !availableModels.some(m => m.startsWith(targetModel))) {
              const matched = availableModels.find(m => m.includes('qwen2.5:7b')) ||
                              availableModels.find(m => m.includes('qwen2.5')) ||
                              availableModels[0];
              if (matched) targetModel = matched;
            }
          }
        }

        console.log(`[AI] Отправка запроса в Ollama (модель: ${targetModel})...`);
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            stream: false,
            options: {
              temperature: 0.5,
              top_p: 0.85,
              num_predict: 350
            }
          }),
          signal: AbortSignal.timeout(90000)
        });

        if (response.ok) {
          const data = await response.json();
          aiAnswer = data?.message?.content || '';
          console.log(`[AI] Ответ успешно получен от Ollama (${targetModel}): ${aiAnswer.substring(0, 50)}...`);
        } else {
          const errText = await response.text();
          console.warn(`[AI] Ollama вернула ошибку (${response.status}):`, errText);
        }
      } catch (ollamaErr) {
        console.warn('[AI] Ollama недоступна:', ollamaErr.message);
      }
    }

    // 3. Fallback-логика на случай полного отключения ИИ-серверов
    if (!aiAnswer) {
      const lower = message.toLowerCase();
      if (lower.includes('рисов') || lower.includes('дизайн') || lower.includes('figma') || lower.includes('photoshop') || lower.includes('арт')) {
        aiAnswer = 'Замечательно! У тебя отличная база для креативных индустрий. На основе твоих навыков рекомендую профессиональную пробу «Создание бренда и UI-кита сервиса» в лаборатории АИТУ. На ней ты сможешь поработать над реальным кейсом и собрать прототип в Figma.';
      } else if (lower.includes('react') || lower.includes('веб') || lower.includes('программир') || lower.includes('код') || lower.includes('сайт')) {
        aiAnswer = 'Отличный выбор! Веб-разработка сейчас на пике востребованности. Рекомендую очную пробу «Разработка веб-приложения на React» в АИТУ СПб (м. Технологический институт).';
      } else if (lower.includes('python') || lower.includes('data') || lower.includes('нейросет') || lower.includes('ml')) {
        aiAnswer = 'Здорово! В аналитике данных и машинном обучении большой потенциал. Тебе отлично подойдет практикум «Аналитика данных и Обучение ML-модели» в АИТУ СПб.';
      } else if (lower.includes('3d') || lower.includes('моделирован') || lower.includes('чпу') || lower.includes('робот')) {
        aiAnswer = 'Прекрасно! Инженерное направление очень востребовано. Попробуй очный практикум «3D-моделирование и печать деталей на ЧПУ» в Инженерном корпусе АИТУ.';
      } else if (lower.includes('сценар')) {
        aiAnswer = 'В Карьерном Навигаторе действуют 3 сценария: Сценарий А (первичное самоопределение), Сценарий Б (погружение в IT и инженерию) и Сценарий В (подготовка к стажировкам и работе с партнерами).';
      } else {
        aiAnswer = `Спасибо за ваш вопрос! Основываясь на анализе ваших склонностей и текущем этапе (${stage}), рекомендую ознакомиться с практическими профпробами в кластерах АИТУ.`;
      }
    }

    // Санитизация ответа от CJK-символов и Markdown (*, #)
    aiAnswer = sanitizeAiResponse(aiAnswer);

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
