import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconSparkles, 
  IconMapPin, 
  IconBrain, 
  IconArrowRight 
} from '../common/Icons';

export const RoleDashboards = ({ activeRole, onNavigateTab }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getStudentProfile()
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch((err) => console.warn('Could not load student stats for dashboard:', err.message));
  }, [activeRole]);

  const topRec = profile?.hasTakenDiagnostic
    ? `${profile.topRecommendation} (${profile.topMatch || 90}%)`
    : 'Тест еще не пройден';

  const upcomingTrialTitle = profile?.upcomingTrials?.[0]?.title || 'Пока нет записей на пробы';
  const currentScenario = profile?.currentScenario || 'A';
  const progressPct = profile?.progressPercent ?? 0;

  const scenarioName = currentScenario === 'B' 
    ? 'Сценарий Б («Углубление в IT/Инженерию»)' 
    : currentScenario === 'C' 
    ? 'Сценарий В («Трудоустройство»)' 
    : 'Сценарий А («Самоопределение»)';

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.dashboardGrid}>
        {/* Diagnostic Card */}
        <div className="card card-hoverable" style={styles.dashCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.iconCircleBlue}>
              <IconBrain size={22} color="#0066ff" />
            </div>
            <span className="badge badge-primary">Результат ИИ</span>
          </div>

          <h3 style={styles.cardTitle}>ИИ-Диагностика Склонностей</h3>
          <p style={styles.cardDesc}>
            Адаптивный алгоритм Холланда (RIASEC) и Soft-Skills опросник.
          </p>

          <div style={styles.highlightBox}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Главное направление:</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0066ff' }}>
              {topRec}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNavigateTab('diagnostics')}>
            {profile?.hasTakenDiagnostic ? 'Смотреть результаты' : 'Пройти тест'} <IconArrowRight size={15} />
          </button>
        </div>

        {/* Map & Pro-trials Card */}
        <div className="card card-hoverable" style={styles.dashCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.iconCircleGold}>
              <IconMapPin size={22} color="#ff9f1c" />
            </div>
            <span className="badge badge-gold">Карта АИТУ</span>
          </div>

          <h3 style={styles.cardTitle}>Профессиональные Пробы АИТУ</h3>
          <p style={styles.cardDesc}>
            Интерактивные кластеры Mazapark (IT, Инженерия, Дизайн, Медицина).
          </p>

          <div style={styles.highlightBox}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Ближайшая запись:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0a2540' }}>
              {upcomingTrialTitle}
            </div>
          </div>

          <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => onNavigateTab('map')}>
            Открыть карту проб <IconArrowRight size={15} />
          </button>
        </div>

        {/* Roadmap Card */}
        <div className="card card-hoverable" style={styles.dashCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.iconCircleGreen}>
              <IconSparkles size={22} color="#10b981" />
            </div>
            <span className="badge badge-success">Прогресс: {progressPct}%</span>
          </div>

          <h3 style={styles.cardTitle}>Персональный Маршрут</h3>
          <p style={styles.cardDesc}>
            Пошаговая образовательная траектория: школа → ВУЗ/СПО → карьера.
          </p>

          <div style={styles.highlightBox}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Текущий трек:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>
              {scenarioName}
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onNavigateTab('roadmap')}>
            Смотреть трек <IconArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {},
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  dashCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  iconCircleBlue: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#f0f9ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleGold: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#fff3e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleGreen: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: '1.1rem',
    color: '#0a2540',
    marginBottom: '6px'
  },
  cardDesc: {
    fontSize: '0.83rem',
    color: '#64748b',
    lineHeight: 1.4,
    marginBottom: '16px'
  },
  highlightBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '18px',
    border: '1px solid #e2e8f0',
    marginTop: 'auto'
  }
};

export default RoleDashboards;
