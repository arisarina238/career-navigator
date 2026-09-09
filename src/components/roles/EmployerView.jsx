import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconCheck, 
  IconBriefcase, 
  IconPlus, 
  IconSparkles,
  IconClose,
  IconMapPin,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconUser,
  IconMail,
  IconEye,
  IconEyeOff,
  IconCalendar,
  IconCheckCircle,
  IconXCircle
} from '../common/Icons';

export const EmployerView = ({ activeTab }) => {
  const [employerInfo, setEmployerInfo] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-tab state within employer workspace
  const [subTab, setSubTab] = useState('vacancies'); // 'vacancies' | 'candidates' | 'applications' | 'invitations'

  // Modals state
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null); // null for create, vacancy obj for edit
  const [vacancyForm, setVacancyForm] = useState({
    title: '',
    salary: '',
    type: 'INTERNSHIP',
    description: '',
    requirements: '',
    location: '',
    isDraft: false
  });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    vacancyId: '',
    title: '',
    message: '',
    interviewDate: ''
  });

  const [notificationMsg, setNotificationMsg] = useState(null);

  const showToast = (text, isError = false) => {
    setNotificationMsg({ text, isError });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const loadEmployerData = () => {
    setLoading(true);
    Promise.all([
      api.getEmployerProfile().catch(() => null),
      api.getEmployerVacancies().catch(() => []),
      api.getEmployerApplicants().catch(() => []),
      api.getEmployerCandidates().catch(() => []),
      api.getEmployerInvitations().catch(() => [])
    ])
      .then(([empProfile, empVacancies, empApps, empCandidates, empInvites]) => {
        if (empProfile) setEmployerInfo(empProfile);
        if (Array.isArray(empVacancies)) setVacancies(empVacancies);
        if (Array.isArray(empApps)) setApplicants(empApps);
        if (Array.isArray(empCandidates)) setCandidates(empCandidates);
        if (Array.isArray(empInvites)) setInvitations(empInvites);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployerData();
  }, []);

  // Modal Open Handlers
  const handleOpenCreateVacancy = () => {
    setEditingVacancy(null);
    setVacancyForm({
      title: '',
      salary: '',
      type: 'INTERNSHIP',
      description: '',
      requirements: '',
      location: employerInfo?.address || 'Санкт-Петербург',
      isDraft: false
    });
    setShowVacancyModal(true);
  };

  const handleOpenEditVacancy = (vac) => {
    setEditingVacancy(vac);
    setVacancyForm({
      title: vac.title,
      salary: vac.salary || '',
      type: vac.type || 'INTERNSHIP',
      description: vac.description || '',
      requirements: Array.isArray(vac.requirements) ? vac.requirements.join(', ') : '',
      location: vac.location || '',
      isDraft: Boolean(vac.isDraft)
    });
    setShowVacancyModal(true);
  };

  const handleSaveVacancy = async (e) => {
    e.preventDefault();
    if (!vacancyForm.title.trim()) {
      alert('Укажите название позиции');
      return;
    }

    try {
      const payload = {
        title: vacancyForm.title.trim(),
        salary: vacancyForm.salary.trim() || 'По результатам собеседования',
        type: vacancyForm.type,
        description: vacancyForm.description.trim(),
        requirements: vacancyForm.requirements,
        location: vacancyForm.location,
        isDraft: vacancyForm.isDraft
      };

      if (editingVacancy) {
        await api.updateEmployerVacancy(editingVacancy.id, payload);
        showToast('Вакансия успешно обновлена');
      } else {
        await api.createEmployerVacancy(payload);
        showToast(vacancyForm.isDraft ? 'Черновик сохранён' : 'Вакансия успешно опубликована');
      }

      setShowVacancyModal(false);
      loadEmployerData();
    } catch (err) {
      alert('Ошибка при сохранении вакансии: ' + err.message);
    }
  };

  const handleTogglePublish = async (vacId) => {
    try {
      await api.togglePublishVacancy(vacId);
      showToast('Статус публикации изменен');
      loadEmployerData();
    } catch (err) {
      alert('Ошибка изменения статуса: ' + err.message);
    }
  };

  const handleDeleteVacancy = async (vacId) => {
    if (!window.confirm('Вы действительно хотите удалить эту позицию?')) return;
    try {
      await api.deleteEmployerVacancy(vacId);
      showToast('Вакансия удалена');
      loadEmployerData();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  // Candidate Invitation Handlers
  const handleOpenInviteModal = (candidate) => {
    setSelectedCandidate(candidate);
    setInviteForm({
      vacancyId: vacancies[0]?.id || '',
      title: vacancies[0] ? vacancies[0].title : 'Приглашение на стажировку',
      message: `Уважаемый(ая) ${candidate.name}! Приглашаем вас пройти собеседование на стажировку в компании «${employerInfo?.companyName || 'Организация-партнер'}».`,
      interviewDate: ''
    });
    setShowInviteModal(true);
  };

  const handleSendInviteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      await api.sendEmployerInvitation({
        studentId: selectedCandidate.id,
        vacancyId: inviteForm.vacancyId || null,
        title: inviteForm.title.trim(),
        message: inviteForm.message.trim(),
        interviewDate: inviteForm.interviewDate || null
      });

      showToast(`Приглашение успешно отправлено кандидату ${selectedCandidate.name}`);
      setShowInviteModal(false);
      loadEmployerData();
    } catch (err) {
      alert('Ошибка отправки приглашения: ' + err.message);
    }
  };

  // Application Status Handler
  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      showToast('Статус отклика успешно обновлен');
      loadEmployerData();
    } catch (err) {
      alert('Ошибка обновления статуса: ' + err.message);
    }
  };

  const companyName = employerInfo?.companyName || 'Организация-партнер Санкт-Петербурга';
  const companyAddress = employerInfo?.address || 'Санкт-Петербург';
  const industry = employerInfo?.industry || 'IT & Инженерия';
  const totalVacancies = vacancies.length;
  const totalApplicants = applicants.length;
  const totalInvitations = invitations.length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: notificationMsg.isError ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <IconCheckCircle size={18} color="#ffffff" />
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* CREATE / EDIT VACANCY MODAL */}
      {showVacancyModal && (
        <div className="modal-overlay" onClick={() => setShowVacancyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-primary">
                  {editingVacancy ? 'Редактирование предложения' : 'Новое предложение'}
                </span>
                <h3 style={{ margin: '4px 0 0 0', color: '#0a2540', fontSize: '1.2rem' }}>
                  {editingVacancy ? 'Изменение позиции' : 'Публикация вакансии / стажировки'}
                </h3>
              </div>
              <button onClick={() => setShowVacancyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <IconClose size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveVacancy} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>Должность или название программы:</label>
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
                <label style={styles.formLabel}>Локация / Район СПб:</label>
                <input
                  type="text"
                  placeholder="Например: Санкт-Петербург, м. Технологический институт"
                  value={vacancyForm.location}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, location: e.target.value })}
                  style={styles.formInput}
                />
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

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.formLabel}>Описание условий и задач:</label>
                <textarea
                  rows={3}
                  placeholder="Опишите задачи, проектную практику и перспективы..."
                  value={vacancyForm.description}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                  style={{ ...styles.formInput, fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="isDraftCheck"
                  checked={vacancyForm.isDraft}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, isDraft: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isDraftCheck" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                  Сохранить как черновик (не публиковать на портале сразу)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVacancyModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">
                  <IconCheck size={16} /> {editingVacancy ? 'Сохранить изменения' : vacancyForm.isDraft ? 'Сохранить черновик' : 'Опубликовать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND INVITATION MODAL */}
      {showInviteModal && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-primary">Приглашение на интервью</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#0a2540', fontSize: '1.2rem' }}>
                  Пригласить кандидата: {selectedCandidate.name}
                </h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <IconClose size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSendInviteSubmit} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>Выберите предложение (вакансию/стажировку):</label>
                <select
                  value={inviteForm.vacancyId}
                  onChange={(e) => {
                    const vac = vacancies.find((v) => v.id === e.target.value);
                    setInviteForm({
                      ...inviteForm,
                      vacancyId: e.target.value,
                      title: vac ? vac.title : inviteForm.title
                    });
                  }}
                  style={styles.formInput}
                >
                  <option value="">-- Общее приглашение на стажировку --</option>
                  {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>{v.title} ({v.typeLabel})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>Тема/Название позиций:</label>
                <input
                  type="text"
                  value={inviteForm.title}
                  onChange={(e) => setInviteForm({ ...inviteForm, title: e.target.value })}
                  style={styles.formInput}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.formLabel}>Желаемая дата интервью (опционально):</label>
                <input
                  type="date"
                  value={inviteForm.interviewDate}
                  onChange={(e) => setInviteForm({ ...inviteForm, interviewDate: e.target.value })}
                  style={styles.formInput}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.formLabel}>Сообщение кандидату:</label>
                <textarea
                  rows={4}
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  style={{ ...styles.formInput, fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">
                  <IconMail size={16} /> Отправить приглашение
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Banner for Employer Workspace */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0a2540 0%, #0066ff 100%)', color: '#ffffff', borderRadius: '24px', boxShadow: '0 12px 30px rgba(0, 102, 255, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
              Кабинет Партнёра-Работодателя Санкт-Петербурга
            </span>
            <h2 style={{ color: '#ffffff', margin: '8px 0 4px 0', fontSize: '1.45rem' }}>
              {companyName}
            </h2>
            <p style={{ color: '#93c5fd', margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconMapPin size={14} color="#93c5fd" />
              {companyAddress} • Верифицированный профиль экосистемы «Работа в России»
            </p>
          </div>

          <button className="btn btn-gold" onClick={handleOpenCreateVacancy}>
            <IconPlus size={16} /> Опубликовать вакансию / стажировку
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSubTab('vacancies')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: subTab === 'vacancies' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: subTab === 'vacancies' ? '#0a2540' : '#ffffff'
            }}
          >
            <IconBriefcase size={16} />
            Мои предложения ({totalVacancies})
          </button>

          <button
            onClick={() => setSubTab('candidates')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: subTab === 'candidates' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: subTab === 'candidates' ? '#0a2540' : '#ffffff'
            }}
          >
            <IconUser size={16} />
            Поиск кандидатов ({candidates.length})
          </button>

          <button
            onClick={() => setSubTab('applications')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: subTab === 'applications' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: subTab === 'applications' ? '#0a2540' : '#ffffff'
            }}
          >
            <IconMail size={16} />
            Входящие отклики ({totalApplicants})
          </button>

          <button
            onClick={() => setSubTab('invitations')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: subTab === 'invitations' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: subTab === 'invitations' ? '#0a2540' : '#ffffff'
            }}
          >
            <IconCheckCircle size={16} />
            Отправленные приглашения ({totalInvitations})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: VACANCIES & INTERNSHIPS LIST */}
      {subTab === 'vacancies' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
                Управление вакансиями и программами стажировок
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Создавайте позиции, сохраняйте черновики и публикуйте предложения для учеников СПб
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreateVacancy}>
              <IconPlus size={16} /> Создать вакансию
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {vacancies.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                {loading ? 'Загрузка позиций...' : 'У вас пока нет созданных вакансий. Нажмите «Создать вакансию», чтобы добавить первую позицию.'}
              </div>
            ) : (
              vacancies.map((v) => (
                <div key={v.id} style={{
                  padding: '18px 20px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: v.isDraft ? '#fafafa' : '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className={`badge ${v.isDraft ? 'badge-navy' : v.isActive ? 'badge-success' : 'badge-gold'}`}>
                        {v.statusLabel}
                      </span>
                      <span className="badge badge-primary">{v.typeLabel}</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>от {v.createdAt}</span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', color: '#0a2540', margin: '0 0 6px 0', fontWeight: 800 }}>
                      {v.title}
                    </h4>

                    <div style={{ fontSize: '0.85rem', color: '#0066ff', fontWeight: 700, marginBottom: '8px' }}>
                      {v.salary} • {v.location}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      {v.description}
                    </p>

                    {v.requirements && v.requirements.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {v.requirements.map((req, idx) => (
                          <span key={idx} style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>
                      <div>Откликов: <strong>{v.applicationsCount}</strong></div>
                      <div>Приглашений: <strong>{v.invitationsCount}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleTogglePublish(v.id)}
                        title={v.isActive ? 'Скрыть позицию в архив' : 'Опубликовать на портале'}
                      >
                        {v.isActive ? <IconEyeOff size={14} color="#64748b" /> : <IconEye size={14} color="#0066ff" />}
                        {v.isActive ? 'В архив' : 'Опубликовать'}
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleOpenEditVacancy(v)}
                        title="Редактировать позицию"
                      >
                        <IconEdit size={14} color="#0a2540" />
                        Изменить
                      </button>

                      <button
                        className="btn"
                        style={{ padding: '6px 10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', borderRadius: '8px' }}
                        onClick={() => handleDeleteVacancy(v.id)}
                        title="Удалить позицию"
                      >
                        <IconTrash size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SEARCH CANDIDATES & SEND INVITATIONS */}
      {subTab === 'candidates' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
                Поиск и отбор подготовленных кандидатов (АИТУ СПб)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Просматривайте результаты ИИ-диагностики учеников и отправляйте персональные приглашения
              </p>
            </div>
            <span className="badge badge-primary">Всего кандидатов: {candidates.length}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {candidates.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', gridColumn: '1 / -1' }}>
                {loading ? 'Загрузка кандидатов...' : 'Кандидаты пока не зарегистрированы.'}
              </div>
            ) : (
              candidates.map((c) => (
                <div key={c.id} style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={c.name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#0a2540', fontWeight: 800 }}>{c.name}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.school} • {c.grade}</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Рекомендация ИИ:</span>
                      <strong style={{ color: '#0066ff' }}>{c.matchScore}%</strong>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0a2540' }}>{c.topDirection}</div>
                  </div>

                  {c.strengths && c.strengths.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {c.strengths.slice(0, 2).map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <IconCheck size={11} color="#047857" />
                          <span>{typeof s === 'object' ? s.title : s}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {c.invitationStatus ? (
                      <span className="badge badge-success">
                        {c.invitationStatus === 'PENDING' ? 'Приглашение отправлено' : c.invitationStatus}
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => handleOpenInviteModal(c)}
                      >
                        <IconMail size={15} color="#ffffff" />
                        Пригласить на интервью
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: INCOMING APPLICATIONS & STATUS PIPELINE */}
      {subTab === 'applications' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
                Реестр входящих откликов кандидатов ({totalApplicants})
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Изменяйте статусы кандидатов в реальном времени. Кандидат мгновенно получит уведомление в системе.
              </p>
            </div>
            <span className="badge badge-primary">Синхронизировано с БД</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Кандидат</th>
                  <th style={{ padding: '12px' }}>ИИ Совпадение</th>
                  <th style={{ padding: '12px' }}>Вакансия</th>
                  <th style={{ padding: '12px' }}>Портфолио & Сертификаты</th>
                  <th style={{ padding: '12px' }}>Текущий статус</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Действия со статусом</th>
                </tr>
              </thead>
              <tbody>
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                      {loading ? 'Загрузка откликов...' : 'Входящих откликов пока нет. Когда ученик откликнется на вашу вакансию, он появится здесь.'}
                    </td>
                  </tr>
                ) : (
                  applicants.map((a) => {
                    const candidateName = a.name || a.candidateName || 'Кандидат';
                    const schoolInfo = a.candidateSchool || '';
                    const matchVal = a.match || (a.matchScore ? `${a.matchScore}%` : '92%');
                    const posTitle = a.position || a.vacancyTitle || 'Стажировка';
                    const details = a.portfolio || a.coverLetter || 'Портфолио профиля АИТУ';
                    const statusText = a.status || a.statusLabel || 'Новый отклик';
                    const statusCode = a.statusCode || '';

                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 700, color: '#0a2540' }}>{candidateName}</div>
                          {schoolInfo && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              {schoolInfo}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 800, color: '#0066ff' }}>{matchVal}</span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>{posTitle}</td>
                        <td style={{ padding: '12px', fontSize: '0.8rem', color: '#475569', maxWidth: '240px' }}>
                          {details}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${
                            statusText === 'Приглашен на интервью' || statusCode === 'INVITED' ? 'badge-primary' :
                            statusText === 'Принят' || statusCode === 'ACCEPTED' ? 'badge-success' :
                            statusText === 'Отклонен' || statusCode === 'REJECTED' ? 'badge-navy' : 'badge-gold'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateApplicationStatus(a.id, 'INVITED')}
                          >
                            Пригласить
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#10b981' }}
                            onClick={() => handleUpdateApplicationStatus(a.id, 'ACCEPTED')}
                          >
                            Принять
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px' }}
                            onClick={() => handleUpdateApplicationStatus(a.id, 'REJECTED')}
                          >
                            Отклонить
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SENT INVITATIONS HISTORY */}
      {subTab === 'invitations' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
                История отправленных приглашений на интервью ({totalInvitations})
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Отслеживайте решения кандидатов (Ожидает ответа / Принято / Отклонено)
              </p>
            </div>
            <span className="badge badge-primary">E2E Flow</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>Кандидат</th>
                  <th style={{ padding: '12px' }}>Позиция</th>
                  <th style={{ padding: '12px' }}>Сообщение</th>
                  <th style={{ padding: '12px' }}>Дата собеседования</th>
                  <th style={{ padding: '12px' }}>Статус ответа</th>
                  <th style={{ padding: '12px' }}>Дата отправки</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                      {loading ? 'Загрузка приглашений...' : 'Вы пока не отправляли персональных приглашений. Используйте вкладку «Поиск кандидатов», чтобы отправить первое приглашение.'}
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#0a2540' }}>{inv.candidateName}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{inv.position}</td>
                      <td style={{ padding: '12px', fontSize: '0.8rem', color: '#475569', maxWidth: '240px' }}>{inv.message}</td>
                      <td style={{ padding: '12px' }}>{inv.interviewDate || 'Не указана'}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${
                          inv.status === 'ACCEPTED' ? 'badge-success' :
                          inv.status === 'REJECTED' ? 'badge-navy' : 'badge-gold'
                        }`}>
                          {inv.statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem' }}>{inv.sentAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
