import { prisma } from '../server/db.js';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Очистка старых данных перед сидированием
  await prisma.jobApplication.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.trialReview.deleteMany();
  await prisma.parentApproval.deleteMany();
  await prisma.trialBooking.deleteMany();
  await prisma.proTrial.deleteMany();
  await prisma.aituZone.deleteMany();
  await prisma.roadmapMilestone.deleteMany();
  await prisma.mentorReview.deleteMany();
  await prisma.roadmapStage.deleteMany();
  await prisma.diagnosticResult.deleteMany();
  await prisma.diagnosticOption.deleteMany();
  await prisma.diagnosticQuestion.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing data.');

  // 2. Создание пользователей и профилей
  // Наставник
  const mentorUser = await prisma.user.create({
    data: {
      id: 'user-mentor-1',
      email: 'volkova.elena@aitu.spb.ru',
      fullName: 'Елена Сергеевна Волкова',
      role: 'MENTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      gosuslugiVerified: true,
      mentorProfile: {
        create: {
          id: 'profile-mentor-1',
          organization: 'МЦК АИТУ / ГБОУ СОШ №214',
          position: 'Куратор профориентации и карьерных траекторий'
        }
      }
    },
    include: { mentorProfile: true }
  });

  // Родитель
  const parentUser = await prisma.user.create({
    data: {
      id: 'user-parent-1',
      email: 'mikhail.smirnov@mail.ru',
      fullName: 'Михаил Анатольевич Смирнов',
      role: 'PARENT',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      gosuslugiVerified: true,
      parentProfile: {
        create: {
          id: 'profile-parent-1'
        }
      }
    },
    include: { parentProfile: true }
  });

  // Школьник (Александр Смирнов)
  const studentUser = await prisma.user.create({
    data: {
      id: 'user-student-1',
      email: 'alex.smirnov@spb-school214.ru',
      fullName: 'Александр Смирнов',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      gosuslugiVerified: true,
      studentProfile: {
        create: {
          id: 'profile-student-1',
          snils: '184-902-112 04',
          school: 'ГБОУ СОШ №214 Санкт-Петербурга',
          grade: '9 "Б"',
          currentScenario: 'B',
          progressPercent: 40,
          mentorId: mentorUser.mentorProfile.id,
          parentId: parentUser.parentProfile.id
        }
      }
    },
    include: { studentProfile: true }
  });

  // Работодатель 1 (Газпром Нефть)
  const emp1User = await prisma.user.create({
    data: {
      id: 'user-emp-1',
      email: 'sokolov.id@gazprom-neft.spb.ru',
      fullName: 'Игорь Дмитриевич Соколов',
      role: 'EMPLOYER',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      gosuslugiVerified: true,
      employerProfile: {
        create: {
          id: 'profile-emp-1',
          companyName: 'ПАО «Газпром Нефть» (Центр Цифровых Технологий)',
          industry: 'IT & Энергетика',
          address: 'Санкт-Петербург, Почтамтская ул., 3-5',
          description: 'Ведущий цифровой кластер Санкт-Петербурга. Создаем интеллектуальные системы управления и промышленный ИИ.',
          logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
          verified: true
        }
      }
    },
    include: { employerProfile: true }
  });

  // Работодатель 2 (VK)
  const emp2User = await prisma.user.create({
    data: {
      id: 'user-emp-2',
      email: 'hr@vk.spb.ru',
      fullName: 'Анна Павлова',
      role: 'EMPLOYER',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      gosuslugiVerified: true,
      employerProfile: {
        create: {
          id: 'profile-emp-2',
          companyName: 'VK (Команда Санкт-Петербурга)',
          industry: 'IT & Социальные сети',
          address: 'Санкт-Петербург, Невский пр., 28 (Дом Зингера)',
          description: 'Технологический гигант. Сервисы ВКонтакте, VK Музыка, VK Клипы, Дзен.',
          logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
          verified: true
        }
      }
    },
    include: { employerProfile: true }
  });

  // Работодатель 3 (Силовые машины)
  const emp3User = await prisma.user.create({
    data: {
      id: 'user-emp-3',
      email: 'hr@power-m.ru',
      fullName: 'Дмитрий Николаевич Орлов',
      role: 'EMPLOYER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      gosuslugiVerified: true,
      employerProfile: {
        create: {
          id: 'profile-emp-3',
          companyName: 'АО «Силовые машины»',
          industry: 'Тяжелое машиностроение',
          address: 'Санкт-Петербург, ул. Ватутина, 3',
          description: 'Крупнейшая энергомашиностроительная компания России. Производство турбин и генераторов.',
          logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=80',
          verified: true
        }
      }
    },
    include: { employerProfile: true }
  });

  console.log('✅ Created users and profiles.');

  // 3. Зоны АИТУ и Профпробы
  const zonesData = [
    {
      id: 'it',
      name: 'IT & Цифровые технологии',
      icon: 'Code',
      color: '#0284c7',
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      description: 'Разработка ПО, ИИ-моделирование, веб-технологии и кибербезопасность',
      isHotZone: true,
      popularTrial: 'Разработка веб-приложений и Python ИИ',
      trials: [
        {
          id: 't-it-1',
          title: 'Разработка веб-приложения на React',
          format: 'Очная профпроба',
          duration: '2 часа',
          address: 'АИТУ СПб, ул. Профсоюзная 14, лаб. 302',
          metro: 'м. Технологический институт (7 мин пешком)',
          nextDate: new Date('2026-08-05T14:00:00Z'),
          availableSlots: 4,
          maxSlots: 12,
          ageLimit: '14-18 лет',
          tags: ['IT', 'Frontend', 'React'],
          rating: 4.9,
          reviewsCount: 34,
          description: 'Попробуйте себя в роли Frontend-разработчика. Под руководством ментора создадите первое интерактивное веб-приложение.',
          employerId: emp1User.employerProfile.id
        },
        {
          id: 't-it-2',
          title: 'Аналитика данных и Обучение ML-модели',
          format: 'Гибридный мастер-класс',
          duration: '3 часа',
          address: 'АИТУ СПб, ауд. 410',
          metro: 'м. Балтийская',
          nextDate: new Date('2026-08-08T16:00:00Z'),
          availableSlots: 6,
          maxSlots: 15,
          ageLimit: '15-18 лет',
          tags: ['Data Science', 'Python', 'AI'],
          rating: 4.8,
          reviewsCount: 22,
          description: 'Практикум по работе с датасетами и обучению нейросети для прогнозирования карьерных трендов.',
          employerId: emp2User.employerProfile.id
        }
      ]
    },
    {
      id: 'engineering',
      name: 'Инженерия & Робототехника',
      icon: 'Cpu',
      color: '#2563eb',
      bgGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      description: '3D-моделирование, станкостроение, ЧПУ и мобильная робототехника',
      isHotZone: true,
      popularTrial: 'Программирование робототехнических комплексов',
      trials: [
        {
          id: 't-eng-1',
          title: '3D-моделирование и печать деталей на ЧПУ',
          format: 'Очный практикум',
          duration: '2.5 часа',
          address: 'Инженерный корпус АИТУ, цех №2',
          metro: 'м. Кировский завод',
          nextDate: new Date('2026-08-06T12:00:00Z'),
          availableSlots: 2,
          maxSlots: 8,
          ageLimit: '13-18 лет',
          tags: ['CAD', '3D Печать', 'Инженерия'],
          rating: 4.95,
          reviewsCount: 45,
          description: 'Создание 3D-модели робототехнического узла в Компас-3D и запуск печати на полимерном принтере.',
          employerId: emp3User.employerProfile.id
        }
      ]
    },
    {
      id: 'design',
      name: 'Креативные индустрии & Дизайн',
      icon: 'Palette',
      color: '#ec4899',
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      description: 'Графический дизайн, UX/UI, анимация и геймдев',
      isHotZone: false,
      popularTrial: 'UX/UI Проектирование мобильных интерфейсов',
      trials: [
        {
          id: 't-des-1',
          title: 'Создание бренда и UI-кита сервиса',
          format: 'Воркшоп',
          duration: '2 часа',
          address: 'АИТУ Медиа-студия, этаж 2',
          metro: 'м. Невский проспект',
          nextDate: new Date('2026-08-07T15:00:00Z'),
          availableSlots: 5,
          maxSlots: 10,
          ageLimit: '12-18 лет',
          tags: ['Figma', 'UI/UX', 'Брендинг'],
          rating: 4.7,
          reviewsCount: 19,
          description: 'Разработка концепта приложения и сборка кликабельного прототипа в Figma.'
        }
      ]
    },
    {
      id: 'medicine',
      name: 'Биомед & Медицинские технологии',
      icon: 'HeartPulse',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      description: 'Лабораторная диагностика, генетика, фармация и первой медпомощь',
      isHotZone: false,
      popularTrial: 'Симуляционный курс симулятора первой помощи',
      trials: [
        {
          id: 't-med-1',
          title: 'Молекулярно-генетическая экспресс-диагностика',
          format: 'Лабораторная проба',
          duration: '2 часа',
          address: 'Биомед симуляционный центр АИТУ',
          metro: 'м. Петроградская',
          nextDate: new Date('2026-08-10T11:00:00Z'),
          availableSlots: 3,
          maxSlots: 8,
          ageLimit: '14-18 лет',
          tags: ['Генетика', 'Биология', 'Медицина'],
          rating: 4.9,
          reviewsCount: 28,
          description: 'Выделение ДНК из растительного образца и проведение ПЦР-анализа под руководством генетика.'
        }
      ]
    },
    {
      id: 'biz',
      name: 'Предпринимательство & Менеджмент',
      icon: 'Briefcase',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
      description: 'Стартапы, экономика, технологический менеджмент и питчинг',
      isHotZone: false,
      popularTrial: 'Симуляционная бизнес-игра «Стартап за 2 часа»',
      trials: [
        {
          id: 't-biz-1',
          title: 'Питчинг инвесторской презентации стартапа',
          format: 'Бизнес-симуляция',
          duration: '2.5 часа',
          address: 'АИТУ Бизнес-инкубатор',
          metro: 'м. Гостиный Двор',
          nextDate: new Date('2026-08-11T14:30:00Z'),
          availableSlots: 8,
          maxSlots: 16,
          ageLimit: '14-18 лет',
          tags: ['Бизнес', 'Стартап', 'Презентация'],
          rating: 4.6,
          reviewsCount: 15,
          description: 'Упаковка бизнес-идеи в юнит-экономику и презентация перед действующими предпринимателями.'
        }
      ]
    }
  ];

  for (const zone of zonesData) {
    const { trials, ...zoneFields } = zone;
    await prisma.aituZone.create({
      data: {
        ...zoneFields,
        trials: {
          create: trials
        }
      }
    });
  }

  console.log('✅ Created AITU Zones and ProTrials.');

  // 4. Вопросы диагностики
  const quizData = [
    {
      category: 'Интересы (RIASEC)',
      questionText: 'Что вам ближе в свободное время?',
      order: 1,
      options: [
        { optionText: 'Разбирать код, создавать программы или исследовать алгоритмы', scores: { it: 5, engineering: 3 } },
        { optionText: 'Проектировать чертежи, собирать 3D-модели и технические устройства', scores: { engineering: 5, it: 2 } },
        { optionText: 'Рисовать интерфейсы, монтировать видео, придумывать дизайн', scores: { design: 5 } },
        { optionText: 'Изучать биологию, проводить химические опыты, помогать людям', scores: { medicine: 5 } },
        { optionText: 'Организовывать проекты, управлять бюджетом, вести переговоры', scores: { biz: 5 } }
      ]
    },
    {
      category: 'Тип мышления',
      questionText: 'Как вы предпочитаете решать сложные задачи?',
      order: 2,
      options: [
        { optionText: 'Строить логические цепочки, анализировать таблицы и цифры', scores: { it: 4, biz: 3 } },
        { optionText: 'Искать нестандартные креативные визуальные решения', scores: { design: 5 } },
        { optionText: 'Тестировать гипотезы на практике руками и приборами', scores: { engineering: 4, medicine: 4 } },
        { optionText: 'Обсуждать в команде и генерировать идеи мозговым штурмом', scores: { biz: 4, design: 2 } }
      ]
    },
    {
      category: 'Soft Skills & Валидация',
      questionText: 'В каком формате работы вам наиболее комфортно?',
      order: 3,
      options: [
        { optionText: 'Индивидуальная глубокая работа с задачей без лишних отвлечений', scores: { it: 4, engineering: 3 } },
        { optionText: 'Командный спринт с четким распределением ролей и дедлайнов', scores: { biz: 4, it: 2 } },
        { optionText: 'Практическая работа в оборудованной мастерской или лаборатории', scores: { engineering: 5, medicine: 4 } }
      ]
    }
  ];

  for (const q of quizData) {
    const { options, ...qFields } = q;
    await prisma.diagnosticQuestion.create({
      data: {
        ...qFields,
        options: {
          create: options
        }
      }
    });
  }

  console.log('✅ Created Diagnostic Questions and Options.');

  // 5. Результаты диагностики для Александра Смирнова
  await prisma.diagnosticResult.create({
    data: {
      studentId: studentUser.studentProfile.id,
      topDirections: [
        { name: 'Data Analyst & Web Dev', match: 94, category: 'IT', desc: 'Высокое аналитическое мышление и интерес к цифровым продуктам' },
        { name: 'Инженер-конструктор ЧПУ', match: 87, category: 'Инженерия', desc: 'Отличные пространственные способности и системное мышление' },
        { name: 'UX/UI Дизайнер продуктов', match: 72, category: 'Дизайн', desc: 'Умеренная креативная склонность с фокусом на логику интерфейса' }
      ],
      scoresDistribution: [
        { label: 'IT & Программирование', percent: 94, color: '#0284c7' },
        { label: 'Инженерия и CAD', percent: 87, color: '#2563eb' },
        { label: 'Креативный Дизайн', percent: 72, color: '#ec4899' },
        { label: 'Бизнес и Проекты', percent: 65, color: '#f59e0b' },
        { label: 'Биомед & Естествознание', percent: 40, color: '#10b981' }
      ],
      strengths: [
        'Аналитический склад ума и склонность к алгоритмизации',
        'Высокая усидчивость при работе с цифровыми массивами данных',
        'Интерес к современным веб-технологиям и языкам программирования',
        'Развитое логическое восприятие причинно-следственных связей'
      ]
    }
  });

  console.log('✅ Created initial Diagnostic Results.');

  // 6. Дорожная карта (Roadmap Stages)
  const roadmapStages = [
    {
      stageNumber: 1,
      title: '1. Школа & ИИ-Диагностика',
      status: 'COMPLETED',
      badge: 'Пройдено',
      subtitle: 'Выявление склонностей (Холланд/Климов)',
      description: 'Определены сильные стороны в сферах IT и Инженерии. Поставлена цель на профильное обучение.',
      order: 1,
      milestones: [
        { title: 'Прохождение комплексного ИИ-теста', isCompleted: true },
        { title: 'Формирование цифрового профиля ученика', isCompleted: true }
      ]
    },
    {
      stageNumber: 2,
      title: '2. Профпробы в АИТУ',
      status: 'IN_PROGRESS',
      badge: 'Текущий этап',
      subtitle: 'Практические пробные погружения',
      description: 'Запланировано 3 пробы: Frontend React (записан), 3D Печать ЧПУ (записан), Data Science (рекомендовано ИИ).',
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

  for (const st of roadmapStages) {
    const { milestones, ...stFields } = st;
    await prisma.roadmapStage.create({
      data: {
        ...stFields,
        studentId: studentUser.studentProfile.id,
        milestones: {
          create: milestones
        }
      }
    });
  }

  console.log('✅ Created Roadmap Stages and Milestones.');

  // 7. Вакансии и стажировки
  await prisma.vacancy.createMany({
    data: [
      {
        employerId: emp1User.employerProfile.id,
        title: 'Младший React-разработчик (Junior)',
        salary: 'от 90 000 ₽',
        type: 'FOR_GRADUATES',
        description: 'Разработка веб-интерфейсов для корпоративных платформ анализа данных.',
        requirements: ['React', 'JavaScript/TypeScript', 'HTML/CSS']
      },
      {
        employerId: emp1User.employerProfile.id,
        title: 'Стажер Python / Data Analyst',
        salary: 'Стипендия 45 000 ₽',
        type: 'INTERNSHIP',
        description: 'Обработка данных телеметрии, построение дашбордов и обучение базовых моделей ML.',
        requirements: ['Python', 'SQL', 'Базовая математика']
      },
      {
        employerId: emp2User.employerProfile.id,
        title: 'Стажер Frontend (React / TypeScript)',
        salary: 'Оплачиваемая',
        type: 'INTERNSHIP',
        description: 'Участие в разработке сервисов экосистемы VK.',
        requirements: ['React', 'TypeScript', 'Git']
      },
      {
        employerId: emp2User.employerProfile.id,
        title: 'UX/UI Проектировщик интернирующийся',
        salary: 'По результатам',
        type: 'PRACTICE',
        description: 'Проектирование пользовательских сценариев и дизайн-систем.',
        requirements: ['Figma', 'UX research', 'Коммуникабельность']
      },
      {
        employerId: emp3User.employerProfile.id,
        title: 'Инженер-конструктор (ЧПУ)',
        salary: 'от 85 000 ₽',
        type: 'FOR_GRADUATES',
        description: 'Разработка управляющих программ для станков с ЧПУ и 3D-моделирование узлов.',
        requirements: ['Компас-3D / AutoCAD', 'ЧПУ', 'Материаловедение']
      }
    ]
  });

  console.log('✅ Created Vacancies.');

  // 8. Бронирование профпроб для студента и согласование родителем
  const reactBooking = await prisma.trialBooking.create({
    data: {
      trialId: 't-it-1',
      studentId: studentUser.studentProfile.id,
      status: 'CONFIRMED'
    }
  });

  await prisma.parentApproval.create({
    data: {
      parentId: parentUser.parentProfile.id,
      studentId: studentUser.studentProfile.id,
      bookingId: reactBooking.id,
      status: 'APPROVED',
      title: 'Очная профпроба «Разработка веб-приложения на React» (05.08)'
    }
  });

  const cadBooking = await prisma.trialBooking.create({
    data: {
      trialId: 't-eng-1',
      studentId: studentUser.studentProfile.id,
      status: 'REGISTERED'
    }
  });

  await prisma.parentApproval.create({
    data: {
      parentId: parentUser.parentProfile.id,
      studentId: studentUser.studentProfile.id,
      bookingId: cadBooking.id,
      status: 'PENDING',
      title: 'Практикум «3D-моделирование и печать деталей на ЧПУ» (06.08)'
    }
  });

  // Отклики на вакансии
  const vacancies = await prisma.vacancy.findMany();
  if (vacancies.length > 0) {
    await prisma.jobApplication.create({
      data: {
        vacancyId: vacancies[0].id,
        studentId: studentUser.studentProfile.id,
        status: 'INVITED',
        matchScore: 94,
        coverLetter: 'Здравствуйте! Прошел профориентацию в АИТУ с результатом 94% IT. Очень хочу на стажировку.'
      }
    });
  }

  // Заметки наставника
  await prisma.mentorReview.create({
    data: {
      mentorId: mentorUser.mentorProfile.id,
      studentId: studentUser.studentProfile.id,
      comment: 'Высокая склонность к математике и алгоритмам. Рекомендовано углубление в разработку ПО и аналитику.',
      isVerified: true
    }
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
