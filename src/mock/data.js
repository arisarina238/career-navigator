// Mock Data based on official specifications for СПб Карьерный Навигатор (АИТУ / Работа в России)

export const USER_ROLES = {
  STUDENT: {
    id: 'student',
    title: 'Участник (Школьник)',
    name: 'Александр Смирнов',
    grade: '9 "Б" класс, ГБОУ СОШ №214',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gosuslugiVerified: true,
    progressPercent: 40,
    currentScenario: 'Сценарий Б («Углубление в IT и инженерию»)',
    completedTrials: 2,
    totalPlanned: 5
  },
  MENTOR: {
    id: 'mentor',
    title: 'Наставник (Педагог / Куратор)',
    name: 'Елена Сергеевна Волкова',
    organization: 'МЦК АИТУ / ГБОУ СОШ №214',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assignedStudentsCount: 28,
    pendingReviews: 4
  },
  PARENT: {
    id: 'parent',
    title: 'Родитель',
    name: 'Михаил Анатольевич Смирнов',
    childName: 'Александр Смирнов (9 "Б")',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    approvalPendingCount: 1
  },
  EMPLOYER: {
    id: 'employer',
    title: 'Работодатель / Партнер',
    companyName: 'ПАО «Газпром Нефть ЦР» / IT Кластер СПб',
    name: 'Игорь Дмитриевич Соколов',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    activeVacancies: 12,
    activeInternships: 5
  }
};

export const AITU_ZONES = [
  {
    id: 'it',
    name: 'IT & Цифровые технологии',
    icon: 'Code',
    color: '#0284c7',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    description: 'Разработка ПО, ИИ-моделирование, веб-технологии и кибербезопасность',
    hotZone: true,
    trialsCount: 8,
    popularTrial: 'Разработка веб-приложений и Python ИИ',
    trials: [
      {
        id: 't-it-1',
        title: 'Разработка веб-приложения на React',
        format: 'Очная профпроба',
        duration: '2 часа',
        address: 'АИТУ СПб, ул. Профсоюзная 14, лаб. 302',
        metro: 'м. Технологический институт (7 мин пешком)',
        nextDate: '2026-08-05 14:00',
        availableSlots: 4,
        maxSlots: 12,
        ageLimit: '14-18 лет',
        tags: ['IT', 'Frontend', 'React'],
        rating: 4.9,
        reviewsCount: 34,
        description: 'Попробуйте себя в роли Frontend-разработчика. Под руководством ментора создадите первое интерактивное веб-приложение.'
      },
      {
        id: 't-it-2',
        title: 'Аналитика данных и Обучение ML-модели',
        format: 'Гибридный мастер-класс',
        duration: '3 часа',
        address: 'АИТУ СПб, ауд. 410',
        metro: 'м. Балтийская',
        nextDate: '2026-08-08 16:00',
        availableSlots: 6,
        maxSlots: 15,
        ageLimit: '15-18 лет',
        tags: ['Data Science', 'Python', 'AI'],
        rating: 4.8,
        reviewsCount: 22,
        description: 'Практикум по работе с датасетами и обучению нейросети для прогнозирования карьерных трендов.'
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
    hotZone: true,
    trialsCount: 6,
    popularTrial: 'Программирование робототехнических комплексов',
    trials: [
      {
        id: 't-eng-1',
        title: '3D-моделирование и печать деталей на ЧПУ',
        format: 'Очный практикум',
        duration: '2.5 часа',
        address: 'Инженерный корпус АИТУ, цех №2',
        metro: 'м. Кировский завод',
        nextDate: '2026-08-06 12:00',
        availableSlots: 2,
        maxSlots: 8,
        ageLimit: '13-18 лет',
        tags: ['CAD', '3D Печать', 'Инженерия'],
        rating: 4.95,
        reviewsCount: 45,
        description: 'Создание 3D-модели робототехнического узла в Компас-3D и запуск печати на полимерном принтере.'
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
    hotZone: false,
    trialsCount: 5,
    popularTrial: 'UX/UI Проектирование мобильных интерфейсов',
    trials: [
      {
        id: 't-des-1',
        title: 'Создание бренда и UI-кита сервиса',
        format: 'Воркшоп',
        duration: '2 часа',
        address: 'АИТУ Медиа-студия, этаж 2',
        metro: 'м. Невский проспект',
        nextDate: '2026-08-07 15:00',
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
    hotZone: false,
    trialsCount: 4,
    popularTrial: 'Симуляционный курс симулятора первой помощи',
    trials: [
      {
        id: 't-med-1',
        title: 'Молекулярно-генетическая экспресс-диагностика',
        format: 'Лабораторная проба',
        duration: '2 часа',
        address: 'Биомед симуляционный центр АИТУ',
        metro: 'м. Петроградская',
        nextDate: '2026-08-10 11:00',
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
    hotZone: false,
    trialsCount: 4,
    popularTrial: 'Симуляционная бизнес-игра «Стартап за 2 часа»',
    trials: [
      {
        id: 't-biz-1',
        title: 'Питчинг инвесторской презентации стартапа',
        format: 'Бизнес-симуляция',
        duration: '2.5 часа',
        address: 'АИТУ Бизнес-инкубатор',
        metro: 'м. Гостиный Двор',
        nextDate: '2026-08-11 14:30',
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

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    category: 'Интересы (RIASEC)',
    question: 'Что вам ближе в свободное время?',
    options: [
      { text: 'Разбирать код, создавать программы или исследовать алгоритмы', scores: { it: 5, engineering: 3 } },
      { text: 'Проектировать чертежи, собирать 3D-модели и технические устройства', scores: { engineering: 5, it: 2 } },
      { text: 'Рисовать интерфейсы, монтировать видео, придумывать дизайн', scores: { design: 5 } },
      { text: 'Изучать биологию, проводить химические опыты, помогать людям', scores: { medicine: 5 } },
      { text: 'Организовывать проекты, управлять бюджетом, вести переговоры', scores: { biz: 5 } }
    ]
  },
  {
    id: 2,
    category: 'Тип мышления',
    question: 'Как вы предпочитаете решать сложные задачи?',
    options: [
      { text: 'Строить логические цепочки, анализировать таблицы и цифры', scores: { it: 4, biz: 3 } },
      { text: 'Искать нестандартные креативные визуальные решения', scores: { design: 5 } },
      { text: 'Тестировать гипотезы на практике руками и приборами', scores: { engineering: 4, medicine: 4 } },
      { text: 'Обсуждать в команде и генерировать идеи мозговым штурмом', scores: { biz: 4, design: 2 } }
    ]
  },
  {
    id: 3,
    category: 'Soft Skills & Валидация',
    question: 'В каком формате работы вам наиболее комфортно?',
    options: [
      { text: 'Индивидуальная глубокая работа с задачей без лишних отвлечений', scores: { it: 4, engineering: 3 } },
      { text: 'Командный спринт с четким распределением ролей и дедлайнов', scores: { biz: 4, it: 2 } },
      { text: 'Практическая работа в оборудованной мастерской или лаборатории', scores: { engineering: 5, medicine: 4 } }
    ]
  }
];

export const MOCK_DIAGNOSTIC_RESULTS = {
  date: '2026-07-28',
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
};

export const CAREER_ROADMAP_STAGES = [
  {
    id: 'stage-1',
    title: '1. Школа & ИИ-Диагностика',
    status: 'completed',
    badge: 'Пройдено',
    subtitle: 'Выявление склонностей (Холланд/Климов)',
    description: 'Определены сильные стороны в сферах IT и Инженерии. Поставлена цель на профильное обучение.'
  },
  {
    id: 'stage-2',
    title: '2. Профпробы в АИТУ',
    status: 'in_progress',
    badge: 'Текущий этап',
    subtitle: 'Практические пробные погружения',
    description: 'Запланировано 3 пробы: Frontend React (записан), 3D Печать ЧПУ (записан), Data Science (рекомендовано ИИ).'
  },
  {
    id: 'stage-3',
    title: '3. Профильное Образование',
    status: 'upcoming',
    badge: 'Предстоит',
    subtitle: 'ВУЗ / Колледж партнер (СПб)',
    description: 'Рекомендуемые заведения: Колледж информационных технологий СПб / СПбПУ Петра Великого (Информатика и ВТ).'
  },
  {
    id: 'stage-4',
    title: '4. Стажировка & Работа',
    status: 'upcoming',
    badge: 'Целевая точка',
    subtitle: 'Партнеры работодатели СПб',
    description: 'ПАО «Газпром Нефть ЦР», VK СПб, Т-Банк Dev — стажировка на 3-м курсе с гарантией трудоустройства.'
  }
];

export const EMPLOYERS_LIST = [
  {
    id: 'emp-1',
    name: 'ПАО «Газпром Нефть» (Центр Цифровых Технологий)',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
    industry: 'IT & Энергетика',
    address: 'Санкт-Петербург, Почтамтская ул., 3-5',
    verified: true,
    description: 'Ведущий цифровой кластер Санкт-Петербурга. Создаем интеллектуальные системы управления и промышленный ИИ.',
    vacancies: [
      { id: 'v1', title: 'Младший React-разработчик (Junior)', salary: 'от 90 000 ₽', type: 'Для выпускников' },
      { id: 'v2', title: 'Стажер Python / Data Analyst', salary: 'Стипендия 45 000 ₽', type: 'Стажировка' }
    ],
    proTrials: ['Экскурсия в цифровой офис Санкт-Петербурга', 'Хакатон по разработке алгоритмов']
  },
  {
    id: 'emp-2',
    name: 'VK (Команда Санкт-Петербурга)',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    industry: 'IT & Социальные сети',
    address: 'Санкт-Петербург, Невский пр., 28 (Дом Зингера)',
    verified: true,
    description: 'Технологический гигант. Сервисы ВКонтакте, VK Музыка, VK Клипы, Дзен.',
    vacancies: [
      { id: 'v3', title: 'Стажер Frontend (React / TypeScript)', salary: 'Оплачиваемая', type: 'Стажировка' },
      { id: 'v4', title: 'UX/UI Проектировщик интернирующийся', salary: 'По результатам', type: 'Практика' }
    ],
    proTrials: ['Мастер-класс от тимлида VK', 'День открытых дверей в Доме Зингера']
  },
  {
    id: 'emp-3',
    name: 'АО «Силовые машины»',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=80',
    industry: 'Тяжелое машиностроение',
    address: 'Санкт-Петербург, ул. Ватутина, 3',
    verified: true,
    description: 'Крупнейшая энергомашиностроительная компания России. Производство турбин и генераторов.',
    vacancies: [
      { id: 'v5', title: 'Инженер-конструктор (ЧПУ)', salary: 'от 85 000 ₽', type: 'Для выпускников СПО/ВУЗ' }
    ],
    proTrials: ['Профпроба на высокотехнологичном ЧПУ станке']
  }
];

export const AI_QUICK_SUGGESTIONS = [
  'Как сопоставляются результаты теста с профпробами?',
  'Покажи карту зон АИТУ и ближайшие профпробы',
  'Как записаться на профпробу по React?',
  'Чем отличаются сценарии А, Б и В?',
  'Может ли наставник добавить пробы в мой маршрут?'
];

export const MOCK_STUDENT_PROFILE = {
  snils: '184-902-112 04',
  school: 'ГБОУ СОШ №214 Санкт-Петербурга',
  grade: '9 "Б"',
  topRecommendation: 'Data Analyst & Web Dev',
  completedTrialsCount: 2,
  upcomingTrials: [
    { title: 'Разработка веб-приложения на React (05.08)' },
    { title: '3D-моделирование и печать деталей на ЧПУ (06.08)' }
  ]
};

