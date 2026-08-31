import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconCheck, 
  IconAward, 
  IconMapPin, 
  IconSparkles, 
  IconCalendar,
  IconEdit,
  IconClose,
  IconArrowRight
} from '../common/Icons';

export const DigitalProfileCard = ({ currentRole }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    school: '',
    grade: '',
    snils: '',
    phone: ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bookingsCollapsed, setBookingsCollapsed] = useState(false);

  const fetchProfile = () => {
    setLoading(true);
    api.getStudentProfile()
      .then((data) => {
        if (data) {
          setProfile(data);
          setEditForm({
            fullName: data.name || currentRole?.name || '',
            school: data.school || '',
            grade: data.grade || '',
            snils: data.snils || '',
            phone: data.phone || ''
          });
        }
      })
      .catch((err) => console.warn('Could not load student profile:', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [currentRole]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudentProfile(editForm);
      setShowEditModal(false);
      setSaveSuccess(true);
      fetchProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Ошибка при сохранении: ' + (err.message || 'Не удалось обновить профиль'));
    }
  };

  const displayName = profile?.name || currentRole?.name || 'Пользователь';
  const displayAvatar = profile?.avatar || currentRole?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const displaySchool = profile?.school || 'ГБОУ СОШ Санкт-Петербурга';
  const displayGrade = profile?.grade || '9 класс';
  const displaySnils = profile?.snils && profile.snils !== 'Не указан' ? profile.snils : 'Не указан';
  const isVerified = profile ? Boolean(profile.gosuslugiVerified) : Boolean(currentRole?.gosuslugiVerified);
  const completedCount = profile?.completedTrialsCount ?? 0;
  const upcomingCount = profile?.upcomingTrials?.length ?? 0;
  const topRec = profile?.hasTakenDiagnostic 
    ? `${profile.topRecommendation} (${profile.topMatch || 90}%)` 
    : 'Тест RIASEC не пройден';

  return (
    <div style={styles.cardWrapper} className="animate-fade-in">
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <span className="badge badge-primary">Редактирование данных</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#0a2540', fontSize: '1.2rem' }}>
                  Цифровой профиль ученика
                </h3>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <IconClose size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.modalLabel}>ФИО ученика:</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  style={styles.modalInput}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={styles.modalLabel}>Образовательное учреждение:</label>
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                    placeholder="Например: ГБОУ СОШ №214 СПб"
                    style={styles.modalInput}
                  />
                </div>
                <div>
                  <label style={styles.modalLabel}>Класс:</label>
                  <input
                    type="text"
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    placeholder="9 класс"
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={styles.modalLabel}>СНИЛС:</label>
                  <input
                    type="text"
                    value={editForm.snils}
                    onChange={(e) => setEditForm({ ...editForm, snils: e.target.value })}
                    placeholder="XXX-XXX-XXX XX"
                    style={styles.modalInput}
                  />
                </div>
                <div>
                  <label style={styles.modalLabel}>Телефон:</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+7 (9XX) XXX-XX-XX"
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary">
                  <IconCheck size={16} /> Сохранить в БД
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '10px 20px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #a7f3d0' }}>
          <IconCheck size={16} color="#10b981" />
          <span>Данные профиля успешно обновлены и сохранены в базе данных!</span>
        </div>
      )}

      {/* Main Profile Info Row */}
      <div style={styles.profileMainRow}>
        <div style={styles.avatarCol}>
          <img src={displayAvatar} alt={displayName} style={styles.avatarImg} />
          <div style={{ ...styles.statusBadge, backgroundColor: isVerified ? '#10b981' : '#64748b' }}>
            <IconCheck size={12} color="#ffffff" />
            <span>{isVerified ? 'ЕСИА Верифицирован' : 'Базовый профиль'}</span>
          </div>
        </div>

        <div style={styles.infoCol}>
          <div style={styles.nameRow}>
            <h2 style={styles.userName}>{displayName}</h2>
            <span style={styles.snilsBadge}>СНИЛС: {displaySnils}</span>
            <button 
              onClick={() => setShowEditModal(true)} 
              style={styles.editBtn}
              title="Редактировать данные профиля"
            >
              <IconEdit size={13} color="#0066ff" />
              <span>Редактировать</span>
            </button>
          </div>

          <div style={styles.schoolRow}>
            <IconMapPin size={15} color="#0066ff" />
            <span>{displaySchool} • {displayGrade}</span>
          </div>

          {/* Quick Metrics Chips */}
          <div style={styles.metricsChipsRow}>
            <div style={styles.chip}>
              <IconSparkles size={14} color="#0066ff" />
              <span>ИИ Совпадение: <strong>{topRec}</strong></span>
            </div>
            <div style={styles.chip}>
              <IconAward size={14} color="#ff9f1c" />
              <span>Завершено проб: <strong>{completedCount}</strong></span>
            </div>
            <div style={styles.chip}>
              <IconCalendar size={14} color="#10b981" />
              <span>Забронировано: <strong>{upcomingCount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ==== Блок записей на профпробы ==== */}
      {profile?.upcomingTrials && profile.upcomingTrials.length > 0 && (
        <div style={styles.bookingsSection}>
          <button
            onClick={() => setBookingsCollapsed((v) => !v)}
            style={styles.bookingsSectionHeader}
          >
            <IconCalendar size={16} color="#0066ff" />
            <span>Мои записи на профессиональные пробы</span>
            <span style={styles.bookingsCount}>{profile.upcomingTrials.length}</span>
            <span style={{
              marginLeft: '4px',
              transition: 'transform 0.25s ease',
              transform: bookingsCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              display: 'inline-flex'
            }}>
              ▾
            </span>
          </button>

          {!bookingsCollapsed && (
            <div style={styles.bookingsList}>
              {profile.upcomingTrials.map((b) => {
                const statusInfo = {
                  REGISTERED: { label: 'Зарегистрирован', color: '#0066ff', bg: '#eff6ff' },
                  CONFIRMED: { label: 'Подтверждено', color: '#10b981', bg: '#ecfdf5' },
                  ATTENDED: { label: 'Пройдено', color: '#7c3aed', bg: '#f5f3ff' },
                  PENDING: { label: 'Ожидает согласия', color: '#f59e0b', bg: '#fffbeb' }
                }[b.status] || { label: b.status, color: '#64748b', bg: '#f1f5f9' };

                return (
                  <div key={b.id} style={styles.bookingCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.bookingZoneBadge}>
                          {b.zoneColor && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: b.zoneColor, display: 'inline-block', marginRight: '5px' }} />
                          )}
                          {b.zoneName}
                          {b.employerName && ` • ${b.employerName}`}
                        </div>
                        <div style={styles.bookingTitle}>{b.title}</div>
                      </div>
                      <span style={{ ...styles.bookingStatusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg }}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div style={styles.bookingMetaRow}>
                      {b.nextDate && (
                        <span style={styles.bookingMeta}>
                          <IconCalendar size={12} color="#64748b" />
                          {b.nextDate}
                        </span>
                      )}
                      {b.metro && (
                        <span style={styles.bookingMeta}>
                          <IconMapPin size={12} color="#64748b" /> {b.metro}
                        </span>
                      )}
                      {b.address && (
                        <span style={styles.bookingMeta}>
                          <IconMapPin size={12} color="#64748b" />
                          {b.address}
                        </span>
                      )}
                      {b.format && (
                        <span style={styles.bookingMeta}>
                          {b.format} • {b.duration}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION: ПРИГЛАШЕНИЯ ОТ РАБОТОДАТЕЛЕЙ (END-TO-END FLOW) */}
      <StudentInvitationsSection />

      {/* Подсказка, если нет записей */}
      {profile && (!profile.upcomingTrials || profile.upcomingTrials.length === 0) && (
        <div style={styles.emptyBookings}>
          <IconUser size={16} color="#64748b" />
          <span>У вас еще нет записей на профессиональные пробы.</span>
          <span style={{ color: '#0066ff', fontWeight: 700, cursor: 'pointer' }}>
            Откройте карту АИТУ <IconArrowRight size={12} color="#0066ff" />
          </span>
        </div>
      )}
    </div>
  );
};

// Компонент списка приглашений от работодателей для кандидата
const StudentInvitationsSection = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = () => {
    setLoading(true);
    api.getStudentInvitations()
      .then((data) => {
        if (Array.isArray(data)) setInvitations(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (id, status) => {
    try {
      await api.respondStudentInvitation(id, status);
      fetchInvitations();
    } catch (err) {
      alert('Ошибка отправки ответа: ' + err.message);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f0f9ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <IconSparkles size={18} color="#0066ff" />
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0a2540' }}>
          Приглашения от компании-работодателей ({invitations.length})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {invitations.map((inv) => (
          <div key={inv.id} style={{
            backgroundColor: '#ffffff',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="badge badge-primary">{inv.employerName}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>от {inv.date}</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a2540' }}>{inv.title}</div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0', lineHeight: 1.4 }}>{inv.message}</p>
              {inv.interviewDate && (
                <div style={{ fontSize: '0.78rem', color: '#0066ff', fontWeight: 700 }}>
                  <IconCalendar size={12} color="#0066ff" /> Дата собеседования: {inv.interviewDate}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {inv.status === 'PENDING' ? (
                <>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                  >
                    Принять
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#ef4444' }}
                    onClick={() => handleRespond(inv.id, 'REJECTED')}
                  >
                    Отклонить
                  </button>
                </>
              ) : (
                <span className={`badge ${inv.status === 'ACCEPTED' ? 'badge-success' : 'badge-navy'}`}>
                  {inv.statusLabel}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  cardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(10, 37, 64, 0.06)',
    marginBottom: '20px'
  },
  bookingsSection: {
    padding: '14px 20px 18px 20px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#fafbff'
  },
  bookingsSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '0.88rem',
    fontWeight: 800,
    color: '#0a2540',
    marginBottom: '12px',
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left'
  },
  bookingsCount: {
    marginLeft: 'auto',
    backgroundColor: '#0066ff',
    color: '#ffffff',
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px'
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '12px 14px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
  },
  bookingZoneBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '2px'
  },
  bookingTitle: {
    fontSize: '0.92rem',
    fontWeight: 800,
    color: '#0a2540'
  },
  bookingStatusBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
    marginLeft: '8px',
    flexShrink: 0
  },
  bookingMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '6px'
  },
  bookingMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#475569',
    fontWeight: 500
  },
  emptyBookings: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px 14px 20px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    color: '#64748b'
  },
  profileMainRow: {
    padding: '16px 20px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  avatarCol: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatarImg: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  statusBadge: {
    marginTop: '-10px',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '0.68rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
  },
  infoCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  userName: {
    margin: 0,
    fontSize: '1.3rem',
    color: '#0a2540'
  },
  snilsBadge: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: 600
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    color: '#0066ff',
    borderRadius: '12px',
    padding: '3px 10px',
    fontSize: '0.74rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  schoolRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: '#475569'
  },
  metricsChipsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '4px'
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '5px 10px',
    fontSize: '0.78rem',
    color: '#334155'
  },
  modalLabel: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '5px'
  },
  modalInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box'
  }
};

export default DigitalProfileCard;
