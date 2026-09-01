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
  const [confidenceScore, setConfidenceScore] = useState(25);
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
        if (res.confidenceScore) setConfidenceScore(res.confidenceScore);
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
        if (res.confidenceScore) setConfidenceScore(res.confidenceScore);
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
                Динамический подбор вопросов в зависимости от ваших ответов
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-navy" style={{ fontSize: '0.78rem' }}>
              Шаг #{stepNumber} (мин. 5 / макс. 10)
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.78rem', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              Точность профиля: {confidenceScore}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div style={styles.track}>
          <div 
            style={{ 
              ...styles.fill, 
              width: `${Math.min(100, Math.max(15, confidenceScore))}%` 
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
              Результаты Адаптивной ИИ-Диагностики
            </h2>
            <p style={{ color: '#93c5fd', margin: 0, fontSize: '0.85rem' }}>
              Дата: {results.date || 'Сегодня'} • Достоверность профиля: {results.confidenceScore || 94}%
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onRestart} style={{ fontSize: '0.85rem' }}>
          <IconRotateCcw size={14} /> Пройти повторно
        </button>
      </div>

      {/* TOP Matches Header */}
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
              Распределение склонностей (RIASEC)
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
              Ключевые опоры и сильные стороны
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.strengths?.map((str, idx) => {
              const isObj = typeof str === 'object' && str !== null;
              const title = isObj ? str.title : str;
              const desc = isObj ? str.description : null;
              const score = isObj ? str.score : null;

              return (
                <div key={idx} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: desc ? '4px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem', color: '#166534' }}>
                      <IconCheck size={16} color="#16a34a" />
                      <span>{title}</span>
                    </div>
                    {score && <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d' }}>{score}</span>}
                  </div>
                  {desc && <p style={{ fontSize: '0.8rem', color: '#14532d', margin: 0, lineHeight: 1.4 }}>{desc}</p>}
                </div>
              );
            })}
          </div>

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
