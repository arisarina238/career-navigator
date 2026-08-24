import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconCheck, 
  IconAward, 
  IconMapPin, 
  IconSparkles, 
  IconCalendar,
  IconEdit,
  IconClose
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
