import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconBrain, 
  IconMapPin, 
  IconCheck, 
  IconCalendar, 
  IconShield,
  IconSparkles,
  IconBarChart,
  IconAward,
  IconUsers,
  IconFileText,
  IconLightbulb,
  IconTrendingUp,
  IconCalendarDays,
  IconCheckCircle,
  IconAlertTriangle
} from '../common/Icons';

export const ParentView = ({ activeTab }) => {
  const [parentInfo, setParentInfo] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadParentData = () => {
    setLoading(true);
    Promise.all([
      api.getParentProfile().catch(() => null),
      api.getParentApprovals().catch(() => [])
    ])
      .then(([pProfile, pApprovals]) => {
        if (pProfile) setParentInfo(pProfile);
        if (Array.isArray(pApprovals)) setApprovals(pApprovals);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParentData();
  }, []);

  const handleApprove = async (approvalId) => {
    try {
      await api.respondParentApproval(approvalId, 'APPROVED');
      setApprovals((prev) =>
        prev.map((a) => (a.id === approvalId ? { ...a, status: 'APPROVED' } : a))
      );
      loadParentData();
    } catch (err) {
      alert('Ошибка при согласовании: ' + err.message);
    }
  };

  const parentName = parentInfo?.name || 'Родитель (Законный представитель)';
  const children = parentInfo?.children || [];
  const primaryChild = children[0] || null;
  const childName = primaryChild ? `${primaryChild.name} (${primaryChild.grade})` : 'Ученик прикреплен';
  const childSchool = primaryChild?.school || 'ГБОУ СОШ Санкт-Петербурга';

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const approvedApprovals = approvals.filter((a) => a.status === 'APPROVED');
  const allApproved = pendingApprovals.length === 0;

  const diag = primaryChild?.diagnosticResult || null;
  const childTopDirection = diag?.topDirections?.[0]?.name || 'IT & Аналитика данных';
  const childTopMatch = diag?.topDirections?.[0]?.match || 94;
  const confidenceScore = diag?.confidenceScore || 92;

  // Fallback / Normalized strengths
  const strengthsList = (diag?.strengths && diag.strengths.length > 0)
    ? diag.strengths
    : [
        {
          title: 'Аналитическое и алгоритмическое мышление',
          score: '94%',
          description: 'Умение быстро декомпозировать сложные задачи, выстраивать строгую логику и находить закономерности в информации.',
          example: 'Легко разбирается в структуре программного кода, таблицах данных и взаимосвязях компонентов.'
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

  // Fallback / Normalized growth areas
  const growthAreasList = (diag?.growthAreas && diag.growthAreas.length > 0)
    ? diag.growthAreas
    : [
        {
          title: 'Усидчивость при выполнении рутинных монотонных задач',
          level: 'Рекомендуется мягкая поддержка',
          description: 'При длительной однообразной работе без видимого быстрого прогресса может временно снижаться концентрация и темп.',
          recommendation: 'Использовать метод коротких спринтов (25 минут фокуса / 5 минут паузы) и наглядно фиксировать каждый завершенный шаг.'
        },
        {
          title: 'Публичная презентация и защита проектов перед аудиторией',
          level: 'Зона активного развития',
          description: 'Склонность глубже погружаться в индивидуальную разработку, чем в ораторскую защиту продукта перед широкой публикой.',
          recommendation: 'Практиковать домашние мини-питчи своих проектов перед родителями и участвовать в дружеских хакатонах СПб.'
        },
        {
          title: 'Управление дедлайнами и перфекционизм в деталях',
          level: 'Точка внимания',
          description: 'Стремление сразу довести проект до абсолютного совершенства иногда затягивает сроки сдачи начального этапа.',
          recommendation: 'Обучение принципу создания первого рабочего прототипа (MVP) с последующей постепенной доработкой.'
        }
      ];

  // Fallback / Normalized parent recommendations
  const parentPlanList = (diag?.parentActionPlan && diag.parentActionPlan.length > 0)
    ? diag.parentActionPlan
    : [
        {
          stage: '1. Домашняя поддержка',
          title: 'Доверительные беседы об интересах',
          description: 'Обсуждайте с ребёнком не формальные школьные оценки, а то, какие реальные задачи и технологии его вдохновляют.',
          practicalTip: 'Спросите: «Какой полезный сервис или устройство ты хотел бы разработать для нашего города?»'
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Parent Hero Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)', color: '#ffffff', borderRadius: '24px', boxShadow: '0 12px 30px rgba(120, 53, 15, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fde68a' }}>
              Кабинет Родителя (Законного Представителя)
            </span>
            <h2 style={{ color: '#ffffff', margin: '8px 0 4px 0', fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconUsers size={24} color="#fde68a" />
              <span>{parentName} • Ребёнок: {childName}</span>
            </h2>
            <p style={{ color: '#fef3c7', margin: 0, fontSize: '0.85rem' }}>
              {childSchool} • Связано через аккаунт ЕСИА Госуслуги родителя
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: '14px', fontSize: '0.82rem' }}>
            <IconShield size={16} color="#fde68a" />
            <span>ЕСИА Связь активна</span>
          </div>
        </div>
      </div>

      {/* PAGE 1: TAB 'profile' (Кабинет Родителя) */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Metric Cards for Parent */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBrain size={22} color="#0066ff" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0066ff' }}>{childTopMatch}% IT</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Главная склонность</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconMapPin size={22} color="#ff9f1c" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff9f1c' }}>{approvals.length} пробы</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Запланировано в АИТУ</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{approvedApprovals.length} из {approvals.length}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Согласовано родителем</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconUsers size={20} color="#0066ff" />
              <span>Обзор активности ребёнка: {primaryChild?.name || 'Ученик'}</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {primaryChild?.name || 'Ребёнок'} проходит этапы профориентации на платформе Санкт-Петербурга. Направление с наибольшим потенциалом: <strong>{childTopDirection}</strong>. Вы можете в один клик подтверждать согласия на выездные практические мероприятия в АИТУ за пределы школы.
            </p>
          </div>
        </div>
      )}

      {/* PAGE 2: TAB 'diagnostics' (Подробный отчет для родителей: Сильные и слабые стороны) */}
      {activeTab === 'diagnostics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card with Confidence */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconBarChart size={24} color="#0066ff" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#0a2540', margin: 0 }}>
                    Детализированный профориентационный отчёт для родителей
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Основан на результатах адаптивного ИИ-тестирования в кластерах Санкт-Петербурга
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-navy">
                  Дата: {diag?.date || '2026-08-01'}
                </span>
                <span className="badge badge-success">
                  Достоверность ИИ-анализа: {confidenceScore}%
                </span>
              </div>
            </div>

            {/* Top 3 Profile Matches */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {diag?.topDirections?.map((d, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-primary">{d.category || 'Профиль'}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0066ff' }}>{d.match}%</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0a2540', marginBottom: '4px' }}>{d.name}</div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{d.desc}</p>
                </div>
              )) || (
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0066ff' }}>{childTopDirection} ({childTopMatch}%)</div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>Высокий потенциал в IT и алгоритмизации.</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: СИЛЬНЫЕ СТОРОНЫ (ОПОРЫ) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <IconAward size={22} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
                  Сильные стороны и ключевые опоры ребёнка
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Способности, на которые стоит опираться при выборе профиля и будущей профессии
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {strengthsList.map((item, idx) => {
                const isObj = typeof item === 'object' && item !== null;
                const title = isObj ? item.title : item;
                const desc = isObj ? item.description : 'Высокий уровень проявления в практической деятельности.';
                const score = isObj ? item.score : null;
                const example = isObj ? item.example : null;

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '16px', 
                      borderRadius: '14px', 
                      backgroundColor: '#f0fdf4', 
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.92rem', color: '#166534' }}>
                        <IconCheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span>{title}</span>
                      </div>
                      {score && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                          {score}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#14532d', margin: 0, lineHeight: 1.45 }}>
                      {desc}
                    </p>
                    {example && (
                      <div style={{ fontSize: '0.78rem', color: '#166534', backgroundColor: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: '8px', marginTop: 'auto' }}>
                        <strong>Пример:</strong> {example}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: ЗОНЫ РОСТА И ПОДДЕРЖКА */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <IconLightbulb size={22} color="#f59e0b" />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
                  Зоны роста и деликатные точки внимания
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Аспекты, требующие мягкой поддержки и развивающих практик без давления
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {growthAreasList.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '16px', 
                    borderRadius: '14px', 
                    backgroundColor: '#fffbeb', 
                    border: '1px solid #fde68a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.92rem', color: '#92400e' }}>
                      <IconAlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                      <span>{item.title}</span>
                    </div>
                    {item.level && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                        {item.level}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0, lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                  {item.recommendation && (
                    <div style={{ fontSize: '0.78rem', color: '#92400e', backgroundColor: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: '8px', marginTop: 'auto' }}>
                      <strong>Как помочь:</strong> {item.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: ПЕРСОНАЛЬНЫЕ РЕКОМЕНДАЦИИ ДЛЯ РОДИТЕЛЕЙ */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <IconTrendingUp size={22} color="#0066ff" />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
                  Пошаговое практическое руководство для родителей
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Рекомендованные действия для совместного развития и подготовки к поступлению
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {parentPlanList.map((plan, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '16px', 
                    borderRadius: '14px', 
                    backgroundColor: '#f0f9ff', 
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <span className="badge badge-navy" style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}>
                    {plan.stage}
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0369a1' }}>
                    {plan.title}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#0c4a6e', margin: 0, lineHeight: 1.45 }}>
                    {plan.description}
                  </p>
                  {plan.practicalTip && (
                    <div style={{ fontSize: '0.78rem', color: '#0369a1', backgroundColor: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: '8px', marginTop: 'auto' }}>
                      <strong>Совет родителю:</strong> {plan.practicalTip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAGE 3: TAB 'map' (Согласование выездов) */}
      {activeTab === 'map' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconFileText size={20} color="#0066ff" />
              <span>Согласование выездных практических мероприятий</span>
            </h3>
            <span className={`badge ${allApproved ? 'badge-success' : 'badge-gold'}`}>
              {allApproved ? 'Все выезды одобрены' : `Требует подписи (${pendingApprovals.length})`}
            </span>
          </div>

          {approvals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              {loading ? 'Загрузка согласований...' : 'Нет активных запросов на согласование.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {approvals.map((appr) => {
                const isPending = appr.status === 'PENDING';
                return (
                  <div 
                    key={appr.id} 
                    style={{ 
                      backgroundColor: isPending ? '#fffbeb' : '#ecfdf5', 
                      border: `1px solid ${isPending ? '#fde68a' : '#a7f3d0'}`, 
                      padding: '18px 20px', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '16px' 
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: isPending ? '#78350f' : '#065f46', marginBottom: '4px' }}>
                        {appr.title}
                      </div>
                      {appr.booking?.trial && (
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <IconMapPin size={14} color="#64748b" />
                          <span>Площадка: {appr.booking.trial.address} (Формат: {appr.booking.trial.format})</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Ученик: <strong>{appr.student?.user?.fullName || primaryChild?.name}</strong> • Запрос: {new Date(appr.requestedAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    {isPending ? (
                      <button 
                        className="btn btn-gold" 
                        onClick={() => handleApprove(appr.id)} 
                        style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                      >
                        <IconCheck size={16} /> Подтвердить согласие
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                        <IconCheckCircle size={18} color="#10b981" />
                        <span>Согласие подтверждено</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PAGE 4: TAB 'roadmap' (Календарь выездов) */}
      {activeTab === 'roadmap' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconCalendarDays size={20} color="#0066ff" />
            <span>Семейный календарь мероприятий ребёнка</span>
          </h3>
          {approvals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              Календарь пуст. Записи на профпробы появятся здесь.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {approvals.map((appr) => (
                <li key={appr.id} style={{ padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0a2540' }}>{appr.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {appr.booking?.trial?.address || 'АИТУ Санкт-Петербург'}
                    </div>
                  </div>
                  <span className={`badge ${appr.status === 'APPROVED' ? 'badge-success' : 'badge-gold'}`}>
                    {appr.status === 'APPROVED' ? 'Согласовано' : 'Ожидает согласия'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentView;
