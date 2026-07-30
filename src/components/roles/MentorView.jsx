import React, { useState } from 'react';
import { 
  IconUser, 
  IconBrain, 
  IconMapPin, 
  IconBot, 
  IconRoadmap, 
  IconCheck, 
  IconPlus, 
  IconAward, 
  IconSearch, 
  IconSparkles,
  IconCalendar,
  IconClose
} from '../common/Icons';

export const MentorView = ({ activeTab, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [mentorNote, setMentorNote] = useState('');
  const [bulkBookingSuccess, setBulkBookingSuccess] = useState(false);

  // Mock Students Data
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Александр Смирнов',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      grade: '9 "Б"',
      aiRecommendation: 'Data Analyst & Web Dev',
      matchPercent: 94,
      cluster: 'IT',
      assignedTrial: 'React Web (05.08)',
      status: 'verified',
      mentorComment: 'Высокая склонность к математике и алгоритмам'
    },
    {
      id: 2,
      name: 'Екатерина Иванова',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      grade: '9 "Б"',
      aiRecommendation: '3D-Моделирование ЧПУ',
      matchPercent: 89,
      cluster: 'Engineering',
      assignedTrial: '3D Печать (06.08)',
      status: 'verified',
      mentorComment: 'Отличные показатели пространственного мышления'
    },
    {
      id: 3,
      name: 'Михаил Петров',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      grade: '9 "Б"',
      aiRecommendation: 'UX/UI Дизайнер интерфейсов',
      matchPercent: 76,
      cluster: 'Design',
      assignedTrial: 'Не зачислен',
      status: 'pending',
      mentorComment: 'Требуется консультация родителя по выбору ВУЗа'
    },
    {
      id: 4,
      name: 'София Ковалева',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      grade: '9 "Б"',
      aiRecommendation: 'Биомед диагностика',
      matchPercent: 82,
      cluster: 'Medicine',
      assignedTrial: 'Генетика (10.08)',
      status: 'verified',
      mentorComment: 'Успешно проходит школьные химические олимпиады'
    },
    {
      id: 5,
      name: 'Артем Васильев',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      grade: '9 "Б"',
      aiRecommendation: 'Технологический стартап',
      matchPercent: 71,
      cluster: 'Business',
      assignedTrial: 'Не зачислен',
      status: 'pending',
      mentorComment: 'Выраженные лидерские качества'
    }
  ]);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.aiRecommendation.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && s.status === 'pending';
    if (statusFilter === 'verified') return matchesSearch && s.status === 'verified';
    return matchesSearch;
  });

  const handleSaveMentorOverride = () => {
    if (!selectedStudentForEdit) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudentForEdit.id ? { ...s, mentorComment: mentorNote || s.mentorComment, status: 'verified' } : s))
    );
    setSelectedStudentForEdit(null);
    setMentorNote('');
  };

  const handleBulkBooking = () => {
    setBulkBookingSuccess(true);
    setTimeout(() => setBulkBookingSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Mentor Override Modal */}
      {selectedStudentForEdit && (
        <div className="modal-overlay" onClick={() => setSelectedStudentForEdit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-primary">Корректировка Наставника</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#0a2540', fontSize: '1.2rem' }}>
                  Ученик: {selectedStudentForEdit.name} ({selectedStudentForEdit.grade})
                </h3>
              </div>
              <button onClick={() => setSelectedStudentForEdit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <IconClose size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>ИИ-Рекомендация алгоритма:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0066ff' }}>
                  {selectedStudentForEdit.aiRecommendation} ({selectedStudentForEdit.matchPercent}% совпадение)
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
                  Педагогическая заметка и ручная корректировка маршрута:
                </label>
                <textarea
                  rows={3}
                  placeholder="Добавьте рекомендацию педагогического коллектива..."
                  value={mentorNote}
                  onChange={(e) => setMentorNote(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedStudentForEdit(null)}>Отмена</button>
                <button className="btn btn-primary" onClick={handleSaveMentorOverride}>
                  <IconCheck size={16} /> Сохранить изменения
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner for Mentor */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', color: '#ffffff', borderRadius: '24px', boxShadow: '0 12px 30px rgba(6, 78, 59, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#a7f3d0' }}>
              Кабинет Педагога-Куратора МКЦ Санкт-Петербурга
            </span>
            <h2 style={{ color: '#ffffff', margin: '8px 0 4px 0', fontSize: '1.45rem' }}>
              Елена Сергеевна Волкова • Закрепленный класс: 9 "Б" (28 учащихся)
            </h2>
            <p style={{ color: '#d1fae5', margin: 0, fontSize: '0.85rem' }}>
              ГБОУ СОШ №214 • Модуль управления и верификации ИИ-маршрутов АИТУ
            </p>
          </div>

          <button className="btn btn-gold" onClick={handleBulkBooking}>
            <IconPlus size={16} /> Забронировать выезд для всей группы
          </button>
        </div>
      </div>

      {bulkBookingSuccess && (
        <div className="card animate-fade-in" style={{ border: '1px solid #10b981', backgroundColor: '#ecfdf5', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46' }}>
            <IconCheck size={20} color="#10b981" />
            <strong>Обязательный выезд «Экскурсия в АИТУ и лаб. 3D-печати» успешно зачислен для всех 28 учеников класса 9 "Б"!</strong>
          </div>
        </div>
      )}

      {/* PAGE 1: TAB 'profile' (Кабинет Наставника) */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* KPI Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUser size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0a2540' }}>28</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Учеников в группе</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBrain size={22} color="#0066ff" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0066ff' }}>84.5%</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Индекс вовлеченности ИИ</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconMapPin size={22} color="#ff9f1c" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff9f1c' }}>16</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Запланировано проб</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconAward size={22} color="#ff4d4f" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff4d4f' }}>2</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Требуют проверки</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', marginBottom: '12px' }}>
              📋 Рабочие виджеты наставника ГБОУ СОШ №214
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#0a2540' }}>Быстрый переход к списку класса</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px 0' }}>Просмотр сохраненных маршрутов и комментарии педагогического коллектива.</p>
                <button className="btn btn-primary" onClick={() => onNavigateTab('roadmap')}>Перейти к списку учеников</button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#0a2540' }}>Групповые выезды в АИТУ</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px 0' }}>Календарь бронирования лаб. 3D-печати и веб-разработки.</p>
                <button className="btn btn-secondary" onClick={() => onNavigateTab('map')}>Календарь выездов</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: TAB 'roadmap' (Группа 9 "Б" — Список учеников и маршруты) */}
      {activeTab === 'roadmap' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0a2540', margin: 0 }}>
                👥 Реестр учеников класса 9 "Б" и Корректировка ИИ-маршрутов
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Вы можете переопределить ИИ-рекомендации для любого учащегося
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                <IconSearch size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Поиск по имени или сфере..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', width: '160px' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '0.82rem', backgroundColor: '#ffffff' }}
              >
                <option value="all">Все статусы</option>
                <option value="verified">Верифицирован</option>
                <option value="pending">Требует проверки</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Ученик</th>
                  <th style={{ padding: '12px' }}>Рекомендация ИИ</th>
                  <th style={{ padding: '12px' }}>Совпадение %</th>
                  <th style={{ padding: '12px' }}>Зачисленная проба</th>
                  <th style={{ padding: '12px' }}>Заметка Наставника</th>
                  <th style={{ padding: '12px' }}>Статус</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Действие</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={s.avatar} alt={s.name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0a2540' }}>{s.name}</div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.grade}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#0a2540' }}>{s.aiRecommendation}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 800, color: '#0066ff' }}>{s.matchPercent}%</span>
                    </td>
                    <td style={{ padding: '12px' }}>{s.assignedTrial}</td>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: '#475569' }}>{s.mentorComment}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${s.status === 'verified' ? 'badge-success' : 'badge-gold'}`}>
                        {s.status === 'verified' ? 'Подтвержден' : 'Проверка'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedStudentForEdit(s);
                          setMentorNote(s.mentorComment);
                        }}
                      >
                        Корректировать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGE 3: TAB 'map' (Назначение профпроб) */}
      {activeTab === 'map' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0a2540', margin: 0 }}>
                📍 Назначение групповых выездов на профпробы АИТУ
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Формирование групповых заявок от ГБОУ СОШ №214
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleBulkBooking}>
              <IconPlus size={16} /> Назначить пробу для всего класса
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Очная проба</span>
              <h4 style={{ margin: '0 0 6px 0', color: '#0a2540' }}>«Разработка веб-приложений React»</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 10px 0' }}>АИТУ СПб, ул. Профсоюзная 14, лаб. 302</p>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0066ff', marginBottom: '12px' }}>
                Зачислено учеников 9 "Б": 12 из 28
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={handleBulkBooking}>
                Записать оставшихся 16 учеников
              </button>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Очный практикум</span>
              <h4 style={{ margin: '0 0 6px 0', color: '#0a2540' }}>«3D-моделирование и печать деталей»</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 10px 0' }}>Инженерный корпус АИТУ (м. Кировский завод)</p>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '12px' }}>
                Зачислено учеников 9 "Б": 16 из 28
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={handleBulkBooking}>
                Управление списком группы
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 4: TAB 'assistant' (Аналитика вовлеченности группы) */}
      {activeTab === 'assistant' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px' }}>
            🤖 ИИ-Аналитика вовлеченности группы 9 "Б"
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0a2540', fontSize: '0.95rem' }}>
                Распределение интересов класса по кластерам:
              </h4>
              <div style={{ display: 'flex', gap: '6px', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ width: '42%', backgroundColor: '#0066ff' }} />
                <div style={{ width: '28%', backgroundColor: '#10b981' }} />
                <div style={{ width: '18%', backgroundColor: '#ff9f1c' }} />
                <div style={{ width: '12%', backgroundColor: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>• IT и Программирование — 42% (12 чел.)</span>
                <span>• Инженерия и Робототехника — 28% (8 чел.)</span>
                <span>• UX/UI Дизайн — 18% (5 чел.)</span>
                <span>• Биомедицина — 12% (3 чел.)</span>
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0a2540', fontSize: '0.95rem' }}>
                Сводный отчёт Soft-skills класса:
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.83rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconCheck size={15} color="#10b981" />
                  <span>Аналитическое мышление: <strong>Высокое (88/100)</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconCheck size={15} color="#10b981" />
                  <span>Командная работа: <strong>Средне-высокое (76/100)</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconCheck size={15} color="#ff9f1c" />
                  <span>Управление дедлайнами: <strong>Требует развития (62/100)</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 5: TAB 'diagnostics' (Сводка ИИ-Диагностики учеников) */}
      {activeTab === 'diagnostics' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px' }}>
            📊 Результаты тестирования Холланда/Климова всего класса
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
            Все 28 участников класса 9 "Б" прошли комплексную диагностику склонностей. Результаты зафиксированы в цифровых профилях Санкт-Петербурга.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {students.map((s) => (
              <div key={s.id} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <img src={s.avatar} alt={s.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0a2540' }}>{s.name}</div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.grade}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0066ff', fontWeight: 700, marginBottom: '4px' }}>
                  ТОП: {s.aiRecommendation} ({s.matchPercent}%)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Заметка наставника: {s.mentorComment}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
