import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import {
  IconBot,
  IconSend,
  IconSparkles,
  IconCheck,
  IconArrowRight,
  IconMapPin,
  IconCalendar,
  IconFlame,
  IconClose
} from '../common/Icons';

const QUICK_SUGGESTIONS = [
  'Я люблю рисовать персонажей и делать макеты в Figma',
  'Мне интересна разработка сайтов на React и JavaScript',
  'Хочу попробовать 3D-моделирование и печать на станках с ЧПУ',
  'Расскажи, какие профпробы есть в кластере АИТУ?',
  'Чем отличаются карьерные сценарии А, Б и В?'
];

const normalizeText = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[\u00AB\u00BB\u201C\u201D\u201E\u201F"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const AiChatWindow = ({
  isModal = false,
  onClose,
  scenario = 'A',
  stage = 'interests'
}) => {
  // ----------------------------------------------------------
  // Состояния
  // ----------------------------------------------------------
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [bookingSuccessId, setBookingSuccessId] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // ----------------------------------------------------------
  // Загрузка сохраненной истории из БД
  // ----------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function loadChatHistory() {
      try {
        setIsHistoryLoading(true);
        const data = await api.getAssistantHistory();

        if (!isMounted) return;

        if (data.session) {
          setSessionId(data.session.id);
        }

        if (data.messages && data.messages.length > 1 && data.recommendations && data.recommendations.length > 0) {
          setRecommendation(data.recommendations[0]);
        }

        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((msg, idx, arr) => {
            let rec = msg.recommendation || null;
            if (!rec && (msg.role === 'assistant' || msg.sender === 'ai') && data.recommendations && data.recommendations.length > 0) {
              const msgNorm = normalizeText(msg.content || msg.text || '');
              const found = data.recommendations.find(r => 
                r.relatedTrial && msgNorm.includes(normalizeText(r.relatedTrial.title))
              );
              if (found) {
                rec = found;
              } else if (idx === arr.length - 1) {
                rec = data.recommendations[0];
              }
            }
            return {
              id: msg.id,
              sender: msg.role === 'assistant' ? 'ai' : (msg.sender || 'user'),
              text: msg.content || msg.text,
              time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.time || getCurrentTime()),
              recommendation: rec
            };
          });
          setMessages(formatted);
        } else {
          // Приветственное сообщение по умолчанию
          setMessages([
            {
              id: 'welcome-1',
              sender: 'ai',
              text:
                'Здравствуйте! Я ваш ИИ-помощник Карьерного Навигатора СПб. ' +
                'Я помогу разобраться в ваших интересах и подобрать ' +
                'подходящие профессиональные пробы в кластерах АИТУ. ' +
                'Расскажите немного о себе: чем вам нравится заниматься?',
              time: getCurrentTime()
            }
          ]);
        }
      } catch (err) {
        console.warn('Could not load chat history from DB:', err.message);
        if (isMounted) {
          setMessages([
            {
              id: 'welcome-default',
              sender: 'ai',
              text:
                'Здравствуйте! Я ваш ИИ-помощник Карьерного Навигатора СПб. ' +
                'Расскажите, какие школьные предметы, хобби или технологии вам ближе всего?',
              time: getCurrentTime()
            }
          ]);
        }
      } finally {
        if (isMounted) setIsHistoryLoading(false);
      }
    }

    loadChatHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Автоскролл
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ----------------------------------------------------------
  // Отправка сообщения
  // ----------------------------------------------------------
  const handleSend = async (textToSend = null) => {
    const text = textToSend !== null ? textToSend : inputVal;
    if (!text.trim() || isLoading) return;

    const cleanText = text.trim();
    setInputVal('');
    setError(null);
    setIsLoading(true);

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const data = await api.sendChatMessage(cleanText, scenario, stage, sessionId);

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.recommendation) {
        setRecommendation(data.recommendation);
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Ответ сформирован.',
        time: getCurrentTime(),
        recommendation: data.recommendation || null
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Ошибка связи с AI:', err);
      setError(err?.message || 'Не удалось получить ответ от ИИ-ассистента');

      const errorMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text:
          'Не удалось связаться с сервером ИИ. Проверьте подключение и повторите попытку.',
        time: getCurrentTime()
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Бронирование профпробы прямо из рекомендации
  const handleBookTrial = async (trialId) => {
    try {
      await api.bookProTrial(trialId);
      setBookingSuccessId(trialId);
      setRecommendation((prev) =>
        prev && prev.relatedTrial?.id === trialId
          ? { ...prev, isBooked: true, bookingStatus: 'REGISTERED' }
          : prev
      );
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.recommendation && msg.recommendation.relatedTrial?.id === trialId) {
            return {
              ...msg,
              recommendation: {
                ...msg.recommendation,
                isBooked: true,
                bookingStatus: 'REGISTERED'
              }
            };
          }
          return msg;
        })
      );
      setTimeout(() => setBookingSuccessId(null), 5000);
    } catch (err) {
      alert(`Ошибка бронирования: ${err.message}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={isModal ? styles.modalWrapper : styles.pageWrapper}
      className="animate-fade-in"
    >
      {/* ======================================================
          ШАПКА ЧАТА
      ====================================================== */}
      <div style={styles.chatHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.botAvatar}>
            <IconBot size={24} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0a2540' }}>
              ИИ-Ассистент
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <span style={styles.onlineDot} />
              Онлайн • Карьерный навигатор
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          СПИСОК СООБЩЕНИЙ
      ====================================================== */}
      <div style={styles.messagesContainer}>
        {isHistoryLoading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.85rem' }}>
            Загрузка диалога...
          </div>
        )}

        {messages.map((message) => {
          const isAi = message.sender === 'ai';

          return (
            <div
              key={message.id}
              style={{
                ...styles.messageRow,
                justifyContent: isAi ? 'flex-start' : 'flex-end'
              }}
            >
              {isAi && (
                <div style={styles.smallBotIcon}>
                  <IconBot size={16} color="#ffffff" />
                </div>
              )}

              <div
                style={{
                  ...styles.bubble,
                  ...(isAi ? styles.aiBubble : styles.userBubble)
                }}
              >
                <p style={styles.bubbleText}>{message.text}</p>

                {/* Интерактивная рекомендация с ProTrial, если привязана */}
                {(() => {
                  if (!message.recommendation) return null;
                  const rec = message.recommendation;
                  const trial = rec.relatedTrial || rec.trial || (rec.title && (rec.format || rec.availableSlots !== undefined) ? rec : null);
                  if (!trial) return null;

                  const isBooked = Boolean(rec.isBooked || bookingSuccessId === trial.id);
                  const bookingStatus = rec.bookingStatus;

                  return (
                    <div style={styles.inlineTrialCard}>
                      <div style={styles.trialCardHeader}>
                        <span style={styles.trialBadge}>РЕКОМЕНДОВАННАЯ ПРОБА</span>
                        {trial.employer && (
                          <span style={styles.trialOrg}>
                            {trial.employer.companyName}
                          </span>
                        )}
                      </div>
                      <h4 style={styles.trialTitle}>
                        {trial.title}
                      </h4>
                      {trial.description && (
                        <p style={styles.trialDesc}>
                          {trial.description}
                        </p>
                      )}

                      <div style={styles.trialMetaRow}>
                        {trial.metro && (
                          <span style={styles.trialMetaItem}>
                            <IconMapPin size={12} color="#64748b" /> {trial.metro}
                          </span>
                        )}
                        {trial.nextDate && (
                          <span style={styles.trialMetaItem}>
                            <IconCalendar size={12} color="#64748b" /> {new Date(trial.nextDate).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                        {trial.availableSlots !== undefined && (
                          <span style={styles.trialMetaItem}>
                            <IconFlame size={12} color="#ff9f1c" /> Мест: {trial.availableSlots} из {trial.maxSlots || 15}
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => !isBooked && handleBookTrial(trial.id)}
                          disabled={isBooked}
                          style={{
                            ...styles.trialBookBtn,
                            backgroundColor: isBooked ? '#10b981' : '#0066ff',
                            cursor: isBooked ? 'default' : 'pointer'
                          }}
                        >
                          {isBooked ? (
                            <>
                              <IconCheck size={14} color="#ffffff" />
                              {bookingStatus === 'CONFIRMED' ? 'Запись подтверждена' : 'Вы уже записаны'}
                            </>
                          ) : (
                            <>
                              Записаться на пробу
                              <IconArrowRight size={14} color="#ffffff" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <span style={styles.timeTag}>{message.time}</span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div style={styles.smallBotIcon}>
              <IconBot size={16} color="#ffffff" />
            </div>
            <div style={{ ...styles.bubble, ...styles.aiBubble }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={styles.loadingDot} />
                <span style={styles.loadingDot} />
                <span style={styles.loadingDot} />
                <span style={{ marginLeft: '6px', color: '#64748b', fontSize: '0.82rem' }}>
                  Формирую ответ...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ======================================================
          ЗАКРЕПЛЕННАЯ РЕКОМЕНДАЦИЯ (АКТИВНАЯ)
      ====================================================== */}
      {recommendation && recommendation.relatedTrial && (
        <div style={styles.activeRecommendationBar}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <IconSparkles size={18} color="#0066ff" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0066ff', textTransform: 'uppercase' }}>
                  Подобранная профпроба:
                </span>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0a2540', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {recommendation.relatedTrial.title}
                </strong>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => !recommendation.isBooked && handleBookTrial(recommendation.relatedTrial.id)}
                disabled={recommendation.isBooked || bookingSuccessId === recommendation.relatedTrial.id}
                style={{
                  ...styles.quickBookBtn,
                  backgroundColor: (recommendation.isBooked || bookingSuccessId === recommendation.relatedTrial.id) ? '#10b981' : '#0066ff',
                  cursor: recommendation.isBooked ? 'default' : 'pointer'
                }}
              >
                {(recommendation.isBooked || bookingSuccessId === recommendation.relatedTrial.id) ? (
                  <>
                    <IconCheck size={12} color="#ffffff" style={{ marginRight: '4px' }} />
                    {recommendation.bookingStatus === 'CONFIRMED' ? 'Подтверждено' : 'Вы записаны'}
                  </>
                ) : (
                  'Записаться'
                )}
              </button>
              <button
                onClick={() => setRecommendation(null)}
                title="Скрыть рекомендацию"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  color: '#64748b'
                }}
              >
                <IconClose size={14} color="#64748b" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================
          БЫСТРЫЕ ПОДСКАЗКИ — скрываются после первого сообщения
      ====================================================== */}
      {!messages.some((m) => m.sender === 'user') && (
        <div style={styles.quickSuggestionsRow}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, width: '100%', marginBottom: '2px' }}>
            Быстрые варианты вопросов:
          </div>
          {QUICK_SUGGESTIONS.map((chip, index) => (
            <button
              key={index}
              style={{
                ...styles.chipBtn,
                ...(isLoading ? styles.disabledButton : {})
              }}
              onClick={() => handleSend(chip)}
              disabled={isLoading}
            >
              <IconSparkles size={12} color="#0066ff" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      )}

      {/* ======================================================
          ПОЛЕ ВВОДА
      ====================================================== */}
      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder={isLoading ? 'ИИ формирует ответ...' : 'Напишите сообщение...'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={{
            ...styles.textInput,
            ...(isLoading ? styles.disabledInput : {})
          }}
        />

        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={isLoading || !inputVal.trim()}
          style={{
            ...styles.sendBtn,
            opacity: isLoading || !inputVal.trim() ? 0.5 : 1
          }}
        >
          <IconSend size={17} color="#ffffff" />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// ПЛАВАЮЩИЙ ВИДЖЕТ
// ============================================================
export const AiAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.floatingBtn}
        title="ИИ-Помощник Карьерного Навигатора"
        aria-label="Открыть ИИ-помощника"
      >
        <IconBot size={28} color="#ffffff" />
        <span style={styles.pulseRing} />
      </button>

      {isOpen && (
        <div style={styles.floatingWindow}>
          <div style={styles.floatingHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBot size={18} color="#ffffff" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Чат с ИИ-Ассистентом
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn} aria-label="Закрыть чат">
              <IconClose size={16} color="#ffffff" />
            </button>
          </div>

          <AiChatWindow isModal={true} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

// ============================================================
// СТИЛИ
// ============================================================
const styles = {
  pageWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '750px',
    maxWidth: '1050px',
    width: '100%',
    margin: '0 auto'
  },
  modalWrapper: {
    height: '700px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    width: '100%',
    minHeight: 0
  },
  chatHeader: {
    backgroundColor: '#f8fafc',
    padding: '14px 20px',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0
  },
  botAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
  },
  onlineDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  messagesContainer: {
    flex: 1,
    minHeight: 0,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    backgroundColor: '#f8fafc'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '9px',
    width: '100%'
  },
  smallBotIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '16px',
    position: 'relative',
    boxSizing: 'border-box'
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
  },
  userBubble: {
    backgroundColor: '#0a2540',
    color: '#ffffff',
    borderBottomRightRadius: '4px'
  },
  bubbleText: {
    margin: 0,
    fontSize: '0.92rem',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word'
  },
  inlineTrialCard: {
    marginTop: '12px',
    padding: '12px 14px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 102, 255, 0.06)'
  },
  trialCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  trialBadge: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#0066ff',
    letterSpacing: '0.04em'
  },
  trialOrg: {
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: 600
  },
  trialTitle: {
    margin: '4px 0 6px 0',
    fontSize: '0.92rem',
    fontWeight: 800,
    color: '#0a2540'
  },
  trialDesc: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#475569',
    lineHeight: 1.45
  },
  trialMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
    fontSize: '0.74rem',
    color: '#334155'
  },
  trialMetaItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '2px 7px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontWeight: 600
  },
  trialBookBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeRecommendationBar: {
    padding: '8px 16px',
    backgroundColor: '#eff6ff',
    borderTop: '1px solid #bfdbfe',
    borderBottom: '1px solid #bfdbfe',
    flexShrink: 0
  },
  quickBookBtn: {
    padding: '5px 12px',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  timeTag: {
    display: 'block',
    fontSize: '0.68rem',
    opacity: 0.6,
    textAlign: 'right',
    marginTop: '4px'
  },
  loadingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#94a3b8',
    display: 'inline-block'
  },
  errorBox: {
    margin: '0 18px 8px 18px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    color: '#9a3412',
    fontSize: '0.75rem',
    flexShrink: 0
  },
  quickSuggestionsRow: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    maxHeight: '120px',
    overflowY: 'auto',
    flexShrink: 0
  },
  chipBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '14px',
    padding: '4px 10px',
    fontSize: '0.74rem',
    color: '#0369a1',
    cursor: 'pointer'
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    flexShrink: 0
  },
  textInput: {
    flex: 1,
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    padding: '10px 16px',
    fontSize: '0.88rem',
    outline: 'none',
    height: '42px',
    boxSizing: 'border-box'
  },
  sendBtn: {
    borderRadius: '50%',
    width: '42px',
    height: '42px',
    padding: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    cursor: 'wait'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  floatingBtn: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    backgroundColor: '#0a2540',
    boxShadow: '0 7px 22px rgba(10, 37, 64, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    cursor: 'pointer',
    border: '2px solid #00b4d8'
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid #0066ff',
    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
    opacity: 0.75,
    pointerEvents: 'none'
  },
  floatingWindow: {
    position: 'fixed',
    bottom: '92px',
    right: '24px',
    width: '520px',
    height: '720px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 110px)',
    borderRadius: '20px',
    boxShadow: '0 15px 45px rgba(0, 0, 0, 0.22)',
    zIndex: 999,
    overflow: 'hidden',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column'
  },
  floatingHeader: {
    backgroundColor: '#0a2540',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '48px',
    flexShrink: 0
  },
  closeBtn: {
    color: '#ffffff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '2px 6px',
    lineHeight: 1
  }
};