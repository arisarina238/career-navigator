import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconCheck, 
  IconBriefcase, 
  IconPlus, 
  IconSparkles,
  IconClose,
  IconMapPin
} from '../common/Icons';

export const EmployerView = ({ activeTab }) => {
  const [employerInfo, setEmployerInfo] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vacancyForm, setVacancyForm] = useState({
    title: '',
    salary: '',
    type: 'INTERNSHIP',
    description: '',
    requirements: ''
  });
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const loadEmployerData = () => {
    setLoading(true);
    Promise.all([
      api.getEmployerProfile().catch(() => null),
      api.getEmployerApplicants().catch(() => [])
    ])
      .then(([empProfile, empApps]) => {
        if (empProfile) setEmployerInfo(empProfile);
        if (Array.isArray(empApps)) setApplicants(empApps);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployerData();
  }, []);

  const handleInvite = async (id) => {
    try {
      await api.updateApplicationStatus(id, 'INVITED');
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Приглашен на интервью' } : a))
      );
    } catch (err) {
      alert('Ошибка при отправке приглашения: ' + err.message);
    }
  };

  const handleCreateVacancy = async (e) => {
    e.preventDefault();
    if (!vacancyForm.title.trim()) return;

    try {
      const reqArray = vacancyForm.requirements
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      await api.createEmployerVacancy({
        title: vacancyForm.title.trim(),
        salary: vacancyForm.salary.trim() || 'По результатам собеседования',
        type: vacancyForm.type,
        description: vacancyForm.description.trim(),
        requirements: reqArray.length > 0 ? reqArray : ['Коммуникабельность', 'Базовые навыки']
      });

      setPublishedSuccess(true);
      setShowAddModal(false);
      setVacancyForm({
        title: '',
        salary: '',
        type: 'INTERNSHIP',
        description: '',
        requirements: ''
      });
      loadEmployerData();
      setTimeout(() => setPublishedSuccess(false), 4000);
    } catch (err) {
      alert('Ошибка при публикации: ' + err.message);
    }
  };

  const companyName = employerInfo?.companyName || 'Организация-партнер Санкт-Петербурга';
  const companyAddress = employerInfo?.address || 'Санкт-Петербург';
  const companyDesc = employerInfo?.description || 'Ведущий технологический партнер Санкт-Петербурга.';
  const industry = employerInfo?.industry || 'IT & Инженерия';
  const totalApplicants = applicants.length;
  const invitedCount = applicants.filter((a) => a.status === 'Приглашен на интервью').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Create Vacancy Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-primary">Новое предложение СПб</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#0a2540', fontSize: '1.2rem' }}>
                  Публикация вакансии или стажировки
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <IconClose size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreateVacancy} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>
                  Должность или название программы:
                </label>
                <input
                  type="text"
                  placeholder="Например: Стажер Frontend (React / TypeScript)"
                  value={vacancyForm.title}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                  style={styles.formInput}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={styles.formLabel}>Тип предложения:</label>
                  <select
                    value={vacancyForm.type}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, type: e.target.value })}
                    style={styles.formInput}
                  >
                    <option value="INTERNSHIP">Стажировка</option>
                    <option value="PRACTICE">Практика</option>
                    <option value="FOR_GRADUATES">Для выпускников</option>
                    <option value="JUNIOR">Junior-позиция</option>
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Оплата / Стипендия:</label>
                  <input
                    type="text"
                    placeholder="Например: от 50 000 ₽"
                    value={vacancyForm.salary}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, salary: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>Требуемые навыки (через запятую):</label>
                <input
                  type="text"
                  placeholder="React, JavaScript, Git, Figma"
                  value={vacancyForm.requirements}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, requirements: e.target.value })}
                  style={styles.formInput}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.formLabel}>
                  Описание условий и задач:
                </label>
                <textarea
                  rows={3}
                  placeholder="Опишите задачи, наставничество и перспективы трудоустройства..."
                  value={vacancyForm.description}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                  style={{ ...styles.formInput, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">
                  <IconCheck size={16} /> Опубликовать в БД
                </button>
              </div>
            </form>
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
              {companyName}
            </h2>
            <p style={{ color: '#e9d5ff', margin: 0, fontSize: '0.85rem' }}>
              {companyAddress} • Верифицированный профиль экосистемы «Работа в России»
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
            <strong>Новая вакансия успешно сохранена в базе данных и опубликована на портале!</strong>
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
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>{totalApplicants}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Откликов кандидатов</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconSparkles size={22} color="#0066ff" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0066ff' }}>{industry}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Отраслевой кластер</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{invitedCount}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Приглашено на интервью</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', marginBottom: '12px' }}>
              🏢 О компании: {companyName}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {companyDesc}
            </p>
          </div>
        </div>
      )}

      {/* PAGE 2: TAB 'employers' (Отклики & Кандидаты) */}
      {activeTab === 'employers' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
              📥 Реестр входящих откликов кандидатов ({totalApplicants} человек)
            </h3>
            <span className="badge badge-primary">Синхронизировано с БД</span>
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
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      {loading ? 'Загрузка откликов...' : 'Входящих откликов пока нет. Отклики учеников появятся здесь автоматически.'}
                    </td>
                  </tr>
                ) : (
                  applicants.map((a) => (
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
                  ))
                )}
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
              📍 Профпробы и экскурсии компании {companyName}
            </h3>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <IconPlus size={16} /> Опубликовать пробу
            </button>
          </div>

          <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4>Экскурсия и день открытых дверей в Санкт-Петербурге</h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{companyAddress} • Формирование кадрового резерва</p>
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
            Размещение предложений на базе АИТУ Санкт-Петербурга позволило привлечь <strong>{totalApplicants}</strong> целевых кандидатов.
            Приглашено на очное интервью: <strong>{invitedCount}</strong> человек.
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  formLabel: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#0a2540',
    marginBottom: '6px'
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box'
  }
};

export default EmployerView;
