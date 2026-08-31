import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconBrain, 
  IconCheck, 
  IconArrowRight, 
  IconRotateCcw, 
  IconSparkles, 
  IconBarChart, 
  IconAward 
} from '../common/Icons';

export const DiagnosticQuiz = ({ onNavigateTab, onComplete }) => {
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [stepNumber, setStepNumber] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [submitError, setSubmitError] = useState(null);

  // Initialize Adaptive Test
  const initAdaptiveTest = async () => {
    setFetchingQuestions(true);
    setSubmitError(null);
    try {
      // Check if diagnostic was already completed
      const savedResult = await api.getDiagnosticResult().catch(() => null);
      if (savedResult && savedResult.topDirections) {
        setResultsData(savedResult);
        setIsCompleted(true);
        setFetchingQuestions(false);
        return;
      }

      // Fetch first adaptive question
      const res = await api.submitAdaptiveStep([]);
      if (res && res.isComplete) {
        setResultsData(res.result);
        setIsCompleted(true);
      } else if (res && res.question) {
        setCurrentQuestion(res.question);
        setStepNumber(res.step || 1);
      }
    } catch (err) {
      console.warn('Error initiating adaptive test:', err.message);
      setSubmitError('Ошибка загрузки адаптивного теста. Попробуйте обновить страницу.');
    } finally {
      setFetchingQuestions(false);
    }
  };

  useEffect(() => {
    initAdaptiveTest();
  }, []);

  const handleSelectOption = (idx) => {
    setSelectedOption(idx);
  };

  const handleNextAdaptiveStep = async () => {
    if (selectedOption === null || !currentQuestion) return;
    const selectedOptObj = currentQuestion.options?.[selectedOption];
    if (!selectedOptObj) return;

    const newHistory = [
      ...history,
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedOptionText: selectedOptObj.text,
        scores: selectedOptObj.scores,
        category: currentQuestion.category
      }
    ];
    setHistory(newHistory);
    setSelectedOption(null);
    setLoading(true);

    try {
      const res = await api.submitAdaptiveStep(newHistory);
      if (res && res.isComplete) {
        setResultsData(res.result);
        setIsCompleted(true);
        if (onComplete) onComplete();
      } else if (res && res.question) {
        setCurrentQuestion(res.question);
        setStepNumber(res.step || newHistory.length + 1);
      }
    } catch (err) {
      console.warn('Adaptive step submit error:', err.message);
      setSubmitError('Не удалось обработать ответ. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setHistory([]);
    setCurrentQuestion(null);
    setStepNumber(1);
    setSelectedOption(null);
    setIsCompleted(false);
    setResultsData(null);
    setSubmitError(null);
    initAdaptiveTest();
  };

  if (fetchingQuestions) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #f1f5f9', borderTopColor: '#0066ff', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ color: '#0a2540', marginBottom: '8px' }}>Анализ адаптивной диагностики...</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Проверяем ваш цифровой профиль и подбираем персональные уточнения</p>
      </div>
    );
  }

  if (isCompleted && resultsData) {
    return <DiagnosticResults results={resultsData} onNavigateTab={onNavigateTab} onRestart={handleRestart} />;
  }

  if (isCompleted && !resultsData) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
        <IconCheck size={48} color="#10b981" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#0a2540', marginBottom: '8px' }}>Тест завершён!</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          {submitError || 'Результаты сохранены в базе данных ваш профиля.'}
        </p>
        <button className="btn btn-primary" onClick={handleRestart}>Пройти ещё раз</button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
        <IconBrain size={48} color="#64748b" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#0a2540', marginBottom: '8px' }}>Диагностика недоступна</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Не удалось сформировать вопрос адаптивного теста.</p>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleRestart}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div style={styles.quizWrapper} className="animate-fade-in">
      {/* Quiz Progress Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={styles.topMeta}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconBrain size={24} color="#0066ff" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0a2540' }}>
                Адаптивная ИИ-Диагностика Склонностей
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Анализирует ваши ответы в режиме реального времени и формирует профессиональный профиль
              </p>
            </div>
          </div>
          <span className="badge badge-primary">
            Адаптивный шаг #{stepNumber}
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div style={styles.track}>
          <div 
            style={{ 
              ...styles.fill, 
              width: `${Math.min(100, (stepNumber / 5) * 100)}%` 
            }} 
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: '32px' }}>
        <span style={styles.categoryBadge}>{currentQuestion.category || 'Уточнение интересов'}</span>
        <h2 style={styles.questionTitle}>{currentQuestion.question}</h2>

        <div style={styles.optionsList}>
          {currentQuestion.options?.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                style={{
                  ...styles.optionBtn,
                  ...(isSelected ? styles.optionSelected : {})
                }}
              >
                <div style={{
                  ...styles.checkboxCircle,
                  ...(isSelected ? styles.checkboxSelected : {})
                }}>
                  {isSelected && <IconCheck size={14} color="#ffffff" />}
                </div>
                <span style={styles.optionText}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.quizFooter}>
          <button 
            className="btn btn-secondary" 
            onClick={handleRestart}
            style={{ visibility: history.length > 0 ? 'visible' : 'hidden' }}
          >
            <IconRotateCcw size={15} /> Сначала
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNextAdaptiveStep}
            disabled={selectedOption === null || loading}
            style={{ opacity: (selectedOption === null || loading) ? 0.6 : 1 }}
          >
            {loading ? 'Анализ ИИ...' : 'Подтвердить и продолжить'}
            <IconArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DiagnosticResults = ({ results, onNavigateTab, onRestart }) => {
  return (
    <div style={styles.resultsWrapper} className="animate-fade-in">
      {/* Overview Banner */}
      <div style={styles.resBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconSparkles size={32} color="#ff9f1c" />
          <div>
            <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.4rem' }}>
              Результаты ИИ-Анализа Диагностики
            </h2>
            <p style={{ color: '#93c5fd', margin: 0, fontSize: '0.85rem' }}>
              Дата прохождения: {results.date || 'Сегодня'} • Сохранено в базу данных Вашего профиля
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onRestart} style={{ fontSize: '0.85rem' }}>
          <IconRotateCcw size={14} /> Пройти повторно
        </button>
      </div>

      {/* TOP Matches Header (Clean SVG, No Emojis) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '24px 0 14px 0' }}>
        <IconAward size={22} color="#0066ff" />
        <h3 style={{ fontSize: '1.2rem', color: '#0a2540', margin: 0 }}>
          Рекомендуемые Профессиональные Направления
        </h3>
      </div>

      <div style={styles.topGrid}>
        {results.topDirections?.map((item, idx) => (
          <div key={idx} className="card card-hoverable" style={styles.topCard}>
            <div style={styles.matchBadgeRow}>
              <span className="badge badge-navy">#{idx + 1} Направление</span>
              <span style={styles.matchValue}>{item.match}%</span>
            </div>
            <h4 style={styles.topName}>{item.name}</h4>
            <p style={styles.topDesc}>{item.desc}</p>
            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <span className="badge badge-primary">{item.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Charts & Strengths */}
      <div style={styles.twoColumnGrid}>
        {/* Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <IconBarChart size={20} color="#0066ff" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0a2540' }}>
              Распределение интересов по шкалам (RIASEC)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {results.scoresDistribution?.map((bar, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{bar.label}</span>
                  <span style={{ fontWeight: 700, color: bar.color }}>{bar.percent}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${bar.percent}%`, backgroundColor: bar.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <IconAward size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0a2540' }}>
              Сильные стороны и рекомендации ИИ
            </h3>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.strengths?.map((str, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                <IconCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{str}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNavigateTab('map')}>
              Перейти к профессиональным пробам АИТУ <IconArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  quizWrapper: {
    maxWidth: '850px',
    margin: '0 auto'
  },
  topMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  track: {
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: '#0066ff',
    transition: 'width 0.3s ease'
  },
  categoryBadge: {
    display: 'inline-block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#0066ff',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '8px'
  },
  questionTitle: {
    fontSize: '1.3rem',
    color: '#0a2540',
    marginBottom: '20px',
    lineHeight: 1.35
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '28px'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  optionSelected: {
    borderColor: '#0066ff',
    backgroundColor: '#f0f9ff',
    boxShadow: '0 2px 6px rgba(0, 102, 255, 0.15)'
  },
  checkboxCircle: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  checkboxSelected: {
    backgroundColor: '#0066ff',
    borderColor: '#0066ff'
  },
  optionText: {
    fontSize: '0.95rem',
    color: '#0f172a',
    fontWeight: 500
  },
  quizFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultsWrapper: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  resBanner: {
    background: 'linear-gradient(135deg, #0a2540 0%, #0066ff 100%)',
    padding: '24px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  topCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  matchBadgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  matchValue: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#0066ff'
  },
  topName: {
    fontSize: '1.1rem',
    color: '#0a2540',
    marginBottom: '6px'
  },
  topDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.4
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginTop: '24px'
  }
};

export default DiagnosticQuiz;
