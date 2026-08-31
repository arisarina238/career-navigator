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
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    setFetchingQuestions(true);

    // Сначала проверяем — может тест уже пройден ранее?
    Promise.all([
      api.getDiagnosticResult().catch(() => null),
      api.getDiagnosticQuestions().catch(() => [])
    ]).then(([savedResult, questionsData]) => {
      if (savedResult && savedResult.topDirections) {
        // Тест уже пройден — показываем результаты сразу
        setResultsData(savedResult);
        setIsCompleted(true);
      }
      if (Array.isArray(questionsData) && questionsData.length > 0) {
        setQuestions(questionsData);
      }
    }).finally(() => setFetchingQuestions(false));
  }, []);

  const currentQ = questions[currentStep] || null;

  const handleSelectOption = (idx) => {
    setSelectedOption(idx);
  };

  const handleNext = async () => {
    if (selectedOption === null || !currentQ) return;
    const selectedOptObj = currentQ?.options?.[selectedOption];
    const newAnswers = [
      ...answers, 
      { 
        questionId: currentQ.id, 
        selectedOptionIndex: selectedOption, 
        scores: selectedOptObj?.scores 
      }
    ];
    setAnswers(newAnswers);

    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    } else {
      // Завершение тестирования и сохранение в БД через Prisma
      setLoading(true);
      setSubmitError(null);
      try {
        const res = await api.submitDiagnosticQuiz(newAnswers);
        if (res && res.topDirections) {
          setResultsData(res);
        } else {
          // Если сервер не вернул topDirections — подгружаем из БД
          const saved = await api.getDiagnosticResult().catch(() => null);
          if (saved) setResultsData(saved);
        }
        // Уведомляем родительский компонент (для обновления маршрута)
        if (onComplete) onComplete();
      } catch (err) {
        setSubmitError('Не удалось сохранить результаты. Попробуйте ещё раз.');
        console.warn('Could not submit quiz to DB:', err.message);
      } finally {
        setLoading(false);
        setIsCompleted(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setIsCompleted(false);
    setAnswers([]);
    setResultsData(null);
    setSubmitError(null);
  };

  if (fetchingQuestions) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #f1f5f9', borderTopColor: '#0066ff', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ color: '#0a2540', marginBottom: '8px' }}>Загрузка диагностики...</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Проверяем ваши результаты и загружаем вопросы</p>
      </div>
    );
  }

  if (questions.length === 0 && !isCompleted) {
    return (
      <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
        <IconBrain size={48} color="#64748b" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#0a2540', marginBottom: '8px' }}>Вопросы временно недоступны</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Не удалось получить список вопросов из базы данных.</p>
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
          {submitError || 'Результаты сохранены. Обновите страницу чтобы увидеть аналитику.'}
        </p>
        <button className="btn btn-primary" onClick={handleRestart}>Пройти ещё раз</button>
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
                Комплексная ИИ-Диагностика Склонностей
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Методики Холланда (RIASEC), Климова и Soft Skills • Адаптивный опросник
              </p>
            </div>
          </div>
          <span className="badge badge-primary">
            Вопрос {currentStep + 1} из {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={styles.track}>
          <div 
            style={{ 
              ...styles.fill, 
              width: `${((currentStep + 1) / questions.length) * 100}%` 
            }} 
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: '32px' }}>
        <span style={styles.categoryBadge}>{currentQ?.category || 'Интересы'}</span>
        <h2 style={styles.questionTitle}>{currentQ?.question}</h2>

        <div style={styles.optionsList}>
          {currentQ?.options?.map((opt, idx) => {
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
            style={{ visibility: currentStep > 0 ? 'visible' : 'hidden' }}
          >
            <IconRotateCcw size={15} /> Сначала
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={selectedOption === null || loading}
            style={{ opacity: (selectedOption === null || loading) ? 0.6 : 1 }}
          >
            {loading ? 'Обработка ИИ...' : currentStep + 1 === questions.length ? 'Завершить и сохранить в БД' : 'Следующий вопрос'}
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

      {/* TOP Matches */}
      <h3 style={{ fontSize: '1.2rem', color: '#0a2540', margin: '24px 0 14px 0' }}>
        🏆 ТОП Рекомендуемых Направлений (Процент Совпадения)
      </h3>

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

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
