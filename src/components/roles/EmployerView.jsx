import React, { useState } from 'react';
import { 
  IconUser, 
  IconCheck, 
  IconBriefcase, 
  IconPlus, 
  IconSearch, 
  IconSparkles,
  IconClose
} from '../common/Icons';

export const EmployerView = ({ activeTab }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVacancyTitle, setNewVacancyTitle] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const [applicants, setApplicants] = useState([
    { id: 1, name: 'Александр Смирнов', match: '94% IT', position: 'Младший React-разработчик', status: 'Приглашен на интервью', portfolio: 'ИИ-Диагностика 94%, Пробы АИТУ: React Web', date: '29.07' },
    { id: 2, name: 'Дмитрий Соколов', match: '91% Backend', position: 'Стажер Python / Data Analyst', status: 'На рассмотрении', portfolio: 'Пробы АИТУ: ML & Python', date: '28.07' },
    { id: 3, name: 'Мария Федорова', match: '88% Data Science', position: 'Стажер Python / Data Analyst', status: 'Новый отклик', portfolio: 'ИИ-Диагностика 88%', date: '30.07' },
    { id: 4, name: 'Игорь Мельников', match: '87% Инженерия', position: 'Инженер-конструктор ЧПУ', status: 'Новый отклик', portfolio: 'Пробы АИТУ: 3D Печать ЧПУ', date: '30.07' }
  ]);

  const handleInvite = (id) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Приглашен на интервью' } : a))
    );
  };

  const handleCreateVacancy = () => {
    if (!newVacancyTitle.trim()) return;
    setPublishedSuccess(true);
    setShowAddModal(false);
    setNewVacancyTitle('');
    setTimeout(() => setPublishedSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Create Vacancy Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-primary">Новое предложение СПб</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#0a2540', fontSize: '1.2rem' }}>
                  Публикация стажировки или профпробы работодателя
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <IconClose size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
                  Должность или название мероприятия:
                </label>
                <input
                  type="text"
                  placeholder="Например: Стажер Frontend (React / TypeScript)"
                  value={newVacancyTitle}
                  onChange={(e) => setNewVacancyTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
                  Условия и целевой уровень (Школьники / Студенты СПО / Выпускники):
                </label>
                <textarea
                  rows={3}
                  placeholder="Опишите требования и формат прохождения (очный офис СПб, стипендия, наставничество)..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Отмена</button>
                <button className="btn btn-primary" onClick={handleCreateVacancy}>
                  <IconCheck size={16} /> Отправить на модерацию СПб
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner for Employer */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', color: '#ffffff', borderRadius: '24px', boxShadow: '0 12px 30px rgba(76, 29, 149, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ddd6fe' }}>
              Кабинет Партнёра-Работодателя Санкт-Петербурга
            </span>
            <h2 style={{ color: '#ffffff', margin: '8px 0 4px 0', fontSize: '1.45rem' }}>
              ПАО «Газпром Нефть» (Центр Цифровых Технологий)
            </h2>
            <p style={{ color: '#e9d5ff', margin: 0, fontSize: '0.85rem' }}>
              Почтамтская ул. 3-5 • Верифицированный профиль экосистемы «Работа в России»
            </p>
          </div>

          <button className="btn btn-gold" onClick={() => setShowAddModal(true)}>
            <IconPlus size={16} /> Опубликовать стажировку / пробу
          </button>
        </div>
      </div>

      {publishedSuccess && (
        <div className="card animate-fade-in" style={{ border: '1px solid #10b981', backgroundColor: '#ecfdf5', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46' }}>
            <IconCheck size={20} color="#10b981" />
            <strong>Новое предложение отправлено в Службу занятости r21.spb.ru на публикацию!</strong>
          </div>
        </div>
      )}

      {/* PAGE 1: TAB 'profile' (Кабинет Компании) */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Metric KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBriefcase size={22} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>14</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Откликов кандидатов</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconSparkles size={22} color="#0066ff" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0066ff' }}>340</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Просмотров профиля</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>5</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Приглашено на интервью</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', marginBottom: '12px' }}>
              🏢 О компании ПАО «Газпром Нефть» (Санкт-Петербург)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Ведущий технологический кластер Санкт-Петербурга. Создаем промышленные нейросети, интеллектуальные системы и сервисы управления энергокомплексом.
            </p>
          </div>
        </div>
      )}

      {/* PAGE 2: TAB 'employers' (Отклики & Кандидаты) */}
      {activeTab === 'employers' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
              📥 Реестр входящих откликов кандидатов (14 человек в кадровом резерве)
            </h3>
            <span className="badge badge-primary">Авто-подбор ИИ %</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Кандидат</th>
                  <th style={{ padding: '12px' }}>ИИ Совпадение %</th>
                  <th style={{ padding: '12px' }}>Вакантная позиция</th>
                  <th style={{ padding: '12px' }}>Портфолио & Сертификаты АИТУ</th>
                  <th style={{ padding: '12px' }}>Статус</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Действие</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0a2540' }}>{a.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 800, color: '#8b5cf6' }}>{a.match}</span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{a.position}</td>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: '#475569' }}>{a.portfolio}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${a.status === 'Приглашен на интервью' ? 'badge-success' : 'badge-navy'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {a.status !== 'Приглашен на интервью' ? (
                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleInvite(a.id)}>
                          Пригласить
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>✓ Приглашение отправлено</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGE 3: TAB 'map' (Профпробы компании) */}
      {activeTab === 'map' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0a2540', margin: 0 }}>
              📍 Профпробы и экскурсии компании ПАО «Газпром Нефть»
            </h3>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <IconPlus size={16} /> Опубликовать пробу
            </button>
          </div>

          <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4>Экскурсия в цифровой офис Санкт-Петербурга</h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Почтамтская ул. 3-5 • 15 зачисленных школьников</p>
          </div>
        </div>
      )}

      {/* PAGE 4: TAB 'assistant' (Аналитика предложений) */}
      {activeTab === 'assistant' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px' }}>
            📊 Аналитика откликов и кадрового резерва
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
            Размещение профпроб на базе АИТУ позволило сформировать кадровый резерв:
            Конверсия просмотров в отклики: <strong>4.1%</strong> • Вовлеченность целевых школ: <strong>ГБОУ СОШ №214 (42%)</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
