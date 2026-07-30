import React from 'react';
import { MOCK_STUDENT_PROFILE } from '../../mock/data';
import { 
  IconCheck, 
  IconAward, 
  IconMapPin, 
  IconSparkles, 
  IconCalendar 
} from '../common/Icons';

export const DigitalProfileCard = ({ currentRole }) => {
  const profile = MOCK_STUDENT_PROFILE;

  return (
    <div style={styles.cardWrapper} className="animate-fade-in">
      {/* Main Profile Info Row */}
      <div style={styles.profileMainRow}>
        <div style={styles.avatarCol}>
          <img src={currentRole.avatar} alt={currentRole.name} style={styles.avatarImg} />
          <div style={styles.statusBadge}>
            <IconCheck size={12} color="#ffffff" />
            <span>ЕСИА Верифицирован</span>
          </div>
        </div>

        <div style={styles.infoCol}>
          <div style={styles.nameRow}>
            <h2 style={styles.userName}>{currentRole.name}</h2>
            <span style={styles.snilsBadge}>СНИЛС: {profile.snils}</span>
          </div>

          <div style={styles.schoolRow}>
            <IconMapPin size={15} color="#0066ff" />
            <span>{profile.school} • Класс {profile.grade}</span>
          </div>

          {/* Quick Metrics Chips */}
          <div style={styles.metricsChipsRow}>
            <div style={styles.chip}>
              <IconSparkles size={14} color="#0066ff" />
              <span>ИИ Совпадение: <strong>94% IT</strong></span>
            </div>
            <div style={styles.chip}>
              <IconAward size={14} color="#ff9f1c" />
              <span>Завершено проб: <strong>{profile.completedTrialsCount}</strong></span>
            </div>
            <div style={styles.chip}>
              <IconCalendar size={14} color="#10b981" />
              <span>Забронировано: <strong>{profile.upcomingTrials.length}</strong></span>
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
    backgroundColor: '#10b981',
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
  }
};
