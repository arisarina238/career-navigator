import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const AI_MODEL = process.env.AI_MODEL || 'qwen3:8b';

app.use(cors());
app.use(express.json());

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
      STUDENT: users.find((u) => u.role === 'STUDENT'),
      MENTOR: users.find((u) => u.role === 'MENTOR'),
      PARENT: users.find((u) => u.role === 'PARENT'),
      EMPLOYER: users.find((u) => u.role === 'EMPLOYER')
    };

    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. ЦИФРОВОЙ ПРОФИЛЬ
// ==========================================

app.get('/api/profile/student', async (req, res) => {
  try {
    const student = await prisma.studentProfile.findFirst({
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
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const latestDiag = student.diagnosticResults[0];
    const topRecommendation = latestDiag?.topDirections?.[0]?.name || 'IT & Аналитика';

    res.json({
      id: student.id,
      userId: student.userId,
      name: student.user.fullName,
      email: student.user.email,
      avatar: student.user.avatarUrl,
      grade: student.grade,
      school: student.school,
      snils: student.snils,
      gosuslugiVerified: student.user.gosuslugiVerified,
      currentScenario: student.currentScenario,
      progressPercent: student.progressPercent,
      topRecommendation,
      completedTrialsCount: student.trialBookings.filter((b) => b.status === 'ATTENDED' || b.status === 'CONFIRMED').length,
      upcomingTrials: student.trialBookings.map((b) => ({
        id: b.id,
        trialId: b.trialId,
        title: b.trial.title,
        nextDate: b.trial.nextDate,
        status: b.status,
        zoneName: b.trial.zone.name
      }))
    });
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

app.post('/api/diagnostics/submit', async (req, res) => {
  try {
    const { answers, studentId } = req.body;
    // Находим студента
    const student = studentId
      ? await prisma.studentProfile.findUnique({ where: { id: studentId } })
      : await prisma.studentProfile.findFirst();

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

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
    const itPct = Math.round(((totalScores.it || 0) / totalPoints) * 100) || 94;
    const engPct = Math.round(((totalScores.engineering || 0) / totalPoints) * 100) || 87;
    const desPct = Math.round(((totalScores.design || 0) / totalPoints) * 100) || 72;
    const bizPct = Math.round(((totalScores.biz || 0) / totalPoints) * 100) || 65;
    const medPct = Math.round(((totalScores.medicine || 0) / totalPoints) * 100) || 40;

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
        progressPercent: Math.max(student.progressPercent, 45)
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
        employer: t.employer ? t.employer.companyName : null
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
    const student = await prisma.studentProfile.findFirst({
      include: { parent: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const trial = await prisma.proTrial.findUnique({ where: { id: trialId } });
    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
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

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. КАРЬЕРНЫЙ МАРШРУТ (ROADMAP)
// ==========================================

app.get('/api/roadmap', async (req, res) => {
  try {
    const student = await prisma.studentProfile.findFirst();
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const stages = await prisma.roadmapStage.findMany({
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

// Отклик на вакансию
app.post('/api/vacancies/:vacancyId/apply', async (req, res) => {
  try {
    const { vacancyId } = req.params;
    const { coverLetter } = req.body;
    const student = await prisma.studentProfile.findFirst();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

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
        matchScore: 92,
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

app.get('/api/mentor/students', async (req, res) => {
  try {
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
          grade: st.grade,
          school: st.school,
          aiRecommendation: topDiag?.topDirections?.[0]?.name || 'IT & Разработка ПО',
          matchPercent: topDiag?.topDirections?.[0]?.match || 94,
          cluster: 'IT',
          assignedTrial: latestBooking ? `${latestBooking.trial.title}` : 'Не зачислен',
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
    const mentor = await prisma.mentorProfile.findFirst();

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

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

// ==========================================
// 8. РОЛИ: РОДИТЕЛЬ (PARENT)
// ==========================================

app.get('/api/parent/approvals', async (req, res) => {
  try {
    const parent = await prisma.parentProfile.findFirst();
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

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
    const { approvalId } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED'

    const approval = await prisma.parentApproval.update({
      where: { id: approvalId },
      data: {
        status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date()
      }
    });

    res.json({ success: true, approval });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 9. ИИ-АССИСТЕНТ (С СОХРАНЕНИЕМ В БД)
// ==========================================

app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, scenario = 'A', stage = 'interests' } = req.body;
    const student = await prisma.studentProfile.findFirst({
      include: { user: true }
    });

    let sessionId = req.body.sessionId;
    let session;

    if (student) {
      if (sessionId) {
        session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
      }
      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            studentId: student.id,
            scenario: scenario === 'B' ? 'B' : scenario === 'C' ? 'C' : 'A',
            currentStage: stage
          }
        });
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
    }

    // Формируем системный промпт и ответ
    let aiAnswer = '';
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: `Ты — ИИ-ассистент Карьерного Навигатора СПб. Помогаешь школьникам и абитуриентам выбрать профессию в Санкт-Петербурге (АИТУ, ВУЗы, предприятия-партнеры: Газпром Нефть, VK, Силовые машины). Сценарий: ${scenario}, Этап: ${stage}. Отвечай дружелюбно, структурированно, емко.`
            },
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

    if (!aiAnswer) {
      // Fallback-ответ при отсутствии активного демо Ollama
      if (message.toLowerCase().includes('react') || message.toLowerCase().includes('проб')) {
        aiAnswer = 'Отличный выбор! Очная профпроба по React разработке проходит в лаборатории АИТУ СПб (м. Технологический институт). Вы можете записаться на неё прямо через раздел «Карта зон АИТУ». Хотите подобрать дополнительные курсы по фронтенду?';
      } else if (message.toLowerCase().includes('сценар')) {
        aiAnswer = 'В Карьерном Навигаторе действуют 3 сценария: Сценарий А (для тех, кто еще не определился), Сценарий Б (углубление в IT и инженерию) и Сценарий В (подготовка к стажировке и трудоустройству). Ваш текущий сценарий — Б.';
      } else {
        aiAnswer = `Спасибо за ваш вопрос! Основываясь на анализе ваших склонностей и текущем этапе (${stage}), рекомендую обратить внимание на IT-кластер АИТУ и практические пробы по веб-разработке и анализу данных. Чем ещё я могу помочь в планировании карьеры?`;
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

    res.json({
      answer: aiAnswer,
      scenario,
      stage,
      sessionId
    });
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
