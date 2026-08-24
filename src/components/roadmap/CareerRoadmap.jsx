import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MentorControlsModal } from './MentorControlsModal';
import { 
  IconRoadmap, 
  IconCheck, 
  IconUser, 
  IconSparkles 
} from '../common/Icons';

export const CareerRoadmap = ({ activeRole }) => {
  const [stages, setStages] = useState([]);
  const [activeScenario, setActiveScenario] = useState('A');
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRoadmap = () => {
    setLoading(true);
    Promise.all([
      api.getCareerRoadmap().catch(() => []),
      api.getStudentProfile().catch(() => null)
    ])
      .then(([stagesData, studentProfile]) => {
        if (Array.isArray(stagesData)) setStages(stagesData);
        if (studentProfile && studentProfile.currentScenario) {
          setActiveScenario(studentProfile.currentScenario);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoadmap();
  }, [activeRole]);

  const handleSelectScenario = async (scen) => {
    setActiveScenario(scen);
    try {
      await api.updateStudentProfile({ currentScenario: scen });
    } catch (err) {
      console.warn('Could not update scenario in DB:', err.message);
    }
  };

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const totalStages = stages.length || 4;

  return (
    <div style={styles.container} className="animate-fade-in">
      <MentorControlsModal isOpen={showMentorModal} onClose={() => setShowMentorModal(false)} />

      {/* Top Scenario Switcher Banner */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={styles.bannerInner}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconRoadmap size={24} color="#0066ff" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0a2540' }}>
                Персональный Образовательный Маршрут ИИ
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Интерактивная дорожная карта («Школа → Профпробы АИТУ → ВУЗ/СПО → Работа»)
            </p>
          </div>

          {activeRole?.id === 'mentor' && (
            <button className="btn btn-navy" onClick={() => setShowMentorModal(true)}>
              <IconUser size={16} /> Корректировка Наставника
            </button>
          )}
        </div>

        {/* Scenarios Indicator */}
        <div style={styles.scenariosRow}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconSparkles size={16} color="#0066ff" />
            <span>Уровень самоопределения (Сценарий ИИ):</span>
          </div>

          <div style={styles.scenarioBtns}>
            <button
              onClick={() => handleSelectScenario('A')}
              style={{
                ...styles.scenBtn,
                ...(activeScenario === 'A' ? styles.scenActive : {})
              }}
            >
              Сценарий А («Не знаю кем»)
            </button>

            <button
              onClick={() => handleSelectScenario('B')}
              style={{
                ...styles.scenBtn,
                ...(activeScenario === 'B' ? styles.scenActive : {})
              }}
            >
              Сценарий Б («Знаю направление IT/Eng»)
            </button>

            <button
              onClick={() => handleSelectScenario('C')}
              style={{
                ...styles.scenBtn,
                ...(activeScenario === 'C' ? styles.scenActive : {})
              }}
            >
              Сценарий В («Знаю профессию»)
            </button>
          </div>
        </div>
      </div>

      {/* Linear Track Roadmap Timeline */}
      <div className="card" style={{ padding: '32px 24px' }}>
        <div style={styles.trackTitleRow}>
          <span className="badge badge-success">Прогресс: {completedCount} из {totalStages} этапов пройдены</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Авто-обновление из базы данных профиля</span>
        </div>

        {loading && stages.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
            Загрузка персонального маршрута...
          </div>
        ) : (
          <div style={styles.timelineWrapper}>
            {stages.map((stage, idx) => {
              const isDone = stage.status === 'completed';
              const isInProgress = stage.status === 'in_progress';
              return (
                <div key={stage.id || idx} style={styles.timelineItem}>
                  {/* Connector Line */}
                  {idx < stages.length - 1 && (
                    <div
                      style={{
                        ...styles.connectorLine,
                        backgroundColor: isDone ? '#10b981' : '#e2e8f0'
                      }}
                    />
                  )}

                  {/* Status Dot */}
                  <div
                    style={{
                      ...styles.dotCircle,
                      ...(isDone ? styles.dotDone : isInProgress ? styles.dotCurrent : styles.dotUpcoming)
                    }}
                  >
                    {isDone ? (
                      <IconCheck size={20} color="#ffffff" />
                    ) : (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isInProgress ? '#0066ff' : '#94a3b8' }}>
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Stage Card */}
                  <div
                    style={{
                      ...styles.stageCard,
                      ...(isInProgress ? styles.stageCardCurrent : {})
                    }}
                  >
                    <div style={styles.stageHeader}>
                      <h4 style={styles.stageTitle}>{stage.title}</h4>
                      <span
                        className={`badge ${
                          isDone ? 'badge-success' : isInProgress ? 'badge-primary' : 'badge-navy'
                        }`}
                      >
                        {stage.badge || (isDone ? 'Пройдено' : isInProgress ? 'Текущий этап' : 'Предстоит')}
                      </span>
                    </div>

                    <div style={styles.stageSubtitle}>{stage.subtitle}</div>
                    <p style={styles.stageDesc}>{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {},
  bannerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px'
  },
  scenariosRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    paddingTop: '14px',
    borderTop: '1px solid #e2e8f0'
  },
  scenarioBtns: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  scenBtn: {
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    fontSize: '0.78rem',
    fontWeight: 500,
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  scenActive: {
    backgroundColor: '#0066ff',
    color: '#ffffff',
    borderColor: '#0066ff',
    fontWeight: 600
  },
  trackTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },
  timelineWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'relative'
  },
  timelineItem: {
    display: 'flex',
    gap: '20px',
    position: 'relative'
  },
  connectorLine: {
    position: 'absolute',
    left: '19px',
    top: '40px',
    bottom: '-24px',
    width: '3px',
    zIndex: 1
  },
  dotCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 2
  },
  dotDone: {
    backgroundColor: '#10b981'
  },
  dotCurrent: {
    backgroundColor: '#e0f2fe',
    border: '3px solid #0066ff'
  },
  dotUpcoming: {
    backgroundColor: '#f1f5f9',
    border: '2px solid #cbd5e1'
  },
  stageCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '18px 20px'
  },
  stageCardCurrent: {
    backgroundColor: '#ffffff',
    borderColor: '#0066ff',
    boxShadow: '0 4px 14px rgba(0, 102, 255, 0.12)'
  },
  stageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  stageTitle: {
    fontSize: '1.05rem',
    color: '#0a2540',
    margin: 0
  },
  stageSubtitle: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#0066ff',
    marginBottom: '8px'
  },
  stageDesc: {
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: 1.4,
    margin: 0
  }
};

export default CareerRoadmap;
