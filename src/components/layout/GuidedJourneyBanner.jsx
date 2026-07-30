import React from 'react';
import { IconSparkles, IconArrowRight, IconCheck } from '../common/Icons';

export const TOUR_STEPS = [
  {
    stepNum: 1,
    tabId: 'profile',
    title: '1. Авторизация & Профиль',
    subtitle: 'Интеграция ЕСИА Госуслуги',
    desc: 'Пользователь авторизуется через Госуслуги. Автоматически создается цифровой профиль профессионального развития с импортом СНИЛС и школы.',
    actionText: 'Перейти к профилю'
  },
  {
    stepNum: 2,
    tabId: 'diagnostics',
    title: '2. ИИ-Диагностика',
    subtitle: 'Тесты Холланда (RIASEC) и Soft Skills',
    desc: 'Адаптивный опросник измеряет интересы. ИИ вычисляет % совпадения с направлениями (напр. Data Analyst 94%).',
    actionText: 'Запустить тест'
  },
  {
    stepNum: 3,
    tabId: 'roadmap',
    title: '3. Персональный Маршрут',
    subtitle: 'Сценарии А, Б, В',
    desc: 'ИИ строит интерактивную дорожную карту: «Школа → Профпробы АИТУ → ВУЗ/СПО → Работа» с правами корректировки наставником.',
    actionText: 'Смотреть маршрут'
  },
  {
    stepNum: 4,
    tabId: 'map',
    title: '4. Карта проб АИТУ',
    subtitle: 'Визуализация зон (Mazapark)',
    desc: 'Кластеры АИТУ (IT, Инженерия, Дизайн, Медицина). Подсвечиваются «горячие» зоны под тест. Бронирование места с логистикой СПб.',
    actionText: 'Открыть карту'
  },
  {
    stepNum: 5,
    tabId: 'employers',
    title: '5. ИИ-Помощник & Вакансии',
    subtitle: 'Стажировки партнеров СПб',
    desc: 'ИИ-помощник сопровождает 24/7. Компании (Газпром Нефть ЦР, VK) предлагают практики и стажировки.',
    actionText: 'К компаниям'
  }
];

export const GuidedJourneyBanner = ({ currentStepIdx, onSelectStep, onNavigateTab }) => {
  const currentStep = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];

  const handleNext = () => {
    const nextIdx = (currentStepIdx + 1) % TOUR_STEPS.length;
    onSelectStep(nextIdx);
    onNavigateTab(TOUR_STEPS[nextIdx].tabId);
  };

  return (
    <div style={styles.banner} className="animate-fade-in">
      <div style={styles.topRow}>
        <div style={styles.badgeLabel}>
          <IconSparkles size={14} color="#ff9f1c" />
          <span>ИНТЕРАКТИВНЫЙ МАРШРУТ ТЗ (ЭКСПРЕСС-ГИД)</span>
        </div>

        <div style={styles.stepCounter}>
          <span>Шаг {currentStepIdx + 1} из {TOUR_STEPS.length}</span>
        </div>
      </div>

      {/* Modern Segmented Stepper */}
      <div style={styles.stepperContainer}>
        {TOUR_STEPS.map((s, idx) => {
          const isActive = currentStepIdx === idx;
          const isPast = currentStepIdx > idx;
          return (
            <button
              key={s.stepNum}
              onClick={() => {
                onSelectStep(idx);
                onNavigateTab(s.tabId);
              }}
              style={{
                ...styles.stepPill,
                ...(isActive ? styles.stepActive : isPast ? styles.stepPast : {})
              }}
            >
              <div style={{
                ...styles.circleDot,
                ...(isActive ? styles.circleActive : isPast ? styles.circlePast : {})
              }}>
                {isPast ? <IconCheck size={12} color="#10b981" /> : idx + 1}
              </div>
              <span style={styles.stepTitleText}>{s.title.split('.')[1] || s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Action Content Box */}
      <div style={styles.actionBox}>
        <div>
          <h4 style={styles.boxHeader}>{currentStep.title} — {currentStep.subtitle}</h4>
          <p style={styles.boxDesc}>{currentStep.desc}</p>
        </div>

        <button className="btn btn-gold" onClick={handleNext} style={styles.actionBtn}>
          <span>{currentStep.actionText}</span>
          <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #0a2540 0%, #003882 100%)',
    borderRadius: '20px',
    padding: '20px 24px',
    color: '#ffffff',
    marginBottom: '24px',
    boxShadow: '0 12px 30px rgba(10, 37, 64, 0.15)',
    overflowX: 'hidden'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  badgeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#ff9f1c',
    letterSpacing: '0.04em'
  },
  stepCounter: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: 600
  },
  stepperContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px',
    marginBottom: '16px'
  },
  stepPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#94a3b8',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },
  stepActive: {
    backgroundColor: '#0066ff',
    borderColor: '#00b4d8',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)'
  },
  stepPast: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    color: '#e2e8f0'
  },
  circleDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  circleActive: {
    backgroundColor: '#ffffff',
    color: '#0066ff'
  },
  circlePast: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)'
  },
  stepTitleText: {
    fontSize: '0.78rem',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  actionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  boxHeader: {
    margin: '0 0 4px 0',
    fontSize: '0.98rem',
    color: '#ffffff'
  },
  boxDesc: {
    margin: 0,
    fontSize: '0.82rem',
    color: '#cbd5e1',
    lineHeight: 1.4
  },
  actionBtn: {
    fontSize: '0.85rem'
  }
};
