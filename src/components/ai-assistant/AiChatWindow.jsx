import React, { useState } from 'react';
import { AI_QUICK_SUGGESTIONS } from '../../mock/data';
import { IconBot, IconSend, IconSparkles } from '../common/Icons';

export const AiChatWindow = ({ isModal = false, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Здравствуйте! Я ваш ИИ-помощник Карьерного Навигатора СПб (АИТУ). Я могу расшифровать результаты вашей диагностики, подобрать профпробу или рассказать о ВУЗах Санкт-Петербурга. Чем могу помочь?',
      time: '16:40'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    setTimeout(() => {
      let aiResponseText = 'На основе вашего профиля в системе и результатов диагностики RIASEC (94% IT / 87% Инженерия), рекомендую обратить внимание на профпробу «Разработка веб-приложений на React» в АИТУ СПб.';
      
      if (text.includes('карта') || text.includes('пробы')) {
        aiResponseText = 'В АИТУ создана карта профориентационных зон по аналогии с Mazapark: кластеры IT, Инженерия, Дизайн, Медицина и Бизнес. Для вас подсвечены горячие зоны IT и Инженерия.';
      } else if (text.includes('сопоставляет') || text.includes('результат')) {
        aiResponseText = 'ИИ работает по многофакторной модели: профиль интересов из теста переводится в теги компетенций и рассчитывает коэффициент совпадения с каждой пробой с учетом возраста и логистики СПб.';
      } else if (text.includes('сценари')) {
        aiResponseText = 'В навигаторе 3 сценария: Сценарий А (расширение кругозора "не знаю кем"), Сценарий Б (углубление в направление), Сценарий В (специализация под конкретную профессию). Сейчас у вас включен Сценарий Б.';
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div style={isModal ? styles.modalWrapper : styles.pageWrapper} className="animate-fade-in">
      {/* Header */}
      <div style={styles.chatHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={styles.botAvatar}>
            <IconBot size={22} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0a2540' }}>
              ИИ-Ассистент Карьерного Навигатора СПб
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={styles.onlineDot} /> Онлайн • Чат сохраняется в цифровом профиле
            </span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div style={styles.messagesContainer}>
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: isAi ? 'flex-start' : 'flex-end'
              }}
            >
              {isAi && (
                <div style={styles.smallBotIcon}>
                  <IconBot size={14} color="#ffffff" />
                </div>
              )}

              <div
                style={{
                  ...styles.bubble,
                  ...(isAi ? styles.aiBubble : styles.userBubble)
                }}
              >
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.45 }}>{msg.text}</p>
                <span style={styles.timeTag}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Suggestions Chips */}
      <div style={styles.quickSuggestionsRow}>
        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, width: '100%', marginBottom: '4px' }}>
          Быстрые вопросы ИИ:
        </div>
        {AI_QUICK_SUGGESTIONS.map((chip, idx) => (
          <button key={idx} style={styles.chipBtn} onClick={() => handleSend(chip)}>
            <IconSparkles size={12} color="#0066ff" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Спросите ассистента о пробах, ВУЗах или результатах тестов..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={styles.textInput}
        />
        <button className="btn btn-primary" onClick={() => handleSend()} style={styles.sendBtn}>
          <IconSend size={16} color="#ffffff" />
        </button>
      </div>
    </div>
  );
};

export const AiAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.floatingBtn}
        title="ИИ-Помощник Карьерного Навигатора"
      >
        <IconBot size={26} color="#ffffff" />
        <span style={styles.pulseRing} />
      </button>

      {/* Floating Modal Window */}
      {isOpen && (
        <div style={styles.floatingWindow}>
          <div style={styles.floatingHeader}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>Чат с ИИ-Ассистентом</span>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
          </div>
          <AiChatWindow isModal={true} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

const styles = {
  pageWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '680px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  modalWrapper: {
    height: '480px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  chatHeader: {
    backgroundColor: '#f8fafc',
    padding: '12px 18px',
    borderBottom: '1px solid #e2e8f0'
  },
  botAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  messagesContainer: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f8fafc'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px'
  },
  smallBotIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '14px',
    position: 'relative'
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: '2px'
  },
  userBubble: {
    backgroundColor: '#0a2540',
    color: '#ffffff',
    borderBottomRightRadius: '2px'
  },
  timeTag: {
    display: 'block',
    fontSize: '0.68rem',
    opacity: 0.6,
    textAlign: 'right',
    marginTop: '4px'
  },
  quickSuggestionsRow: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  chipBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '16px',
    padding: '4px 10px',
    fontSize: '0.75rem',
    color: '#0369a1',
    cursor: 'pointer'
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0'
  },
  textInput: {
    flex: 1,
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    padding: '10px 16px',
    fontSize: '0.88rem',
    outline: 'none'
  },
  sendBtn: {
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    padding: 0
  },
  floatingBtn: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#0a2540',
    boxShadow: '0 6px 18px rgba(10, 37, 64, 0.3)',
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
    opacity: 0.75
  },
  floatingWindow: {
    position: 'fixed',
    bottom: '90px',
    right: '24px',
    width: '380px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    zIndex: 999,
    overflow: 'hidden',
    border: '1px solid #cbd5e1'
  },
  floatingHeader: {
    backgroundColor: '#0a2540',
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    color: '#ffffff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    background: 'none',
    border: 'none'
  }
};
