import React, { useEffect, useRef, useState } from 'react';

import {
  IconBot,
  IconSend,
  IconSparkles
} from '../common/Icons';

const QUICK_SUGGESTIONS = [
  'Как сопоставляются результаты теста с профпробами?',
  'Покажи карту зон АИТУ и ближайшие профпробы',
  'Как записаться на профпробу по React?',
  'Чем отличаются сценарии А, Б и В?',
  'Может ли наставник добавить пробы в мой маршрут?'
];


// ============================================================
// НАСТРОЙКИ
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001';


// ============================================================
// AI CHAT WINDOW
// ============================================================

export const AiChatWindow = ({
  isModal = false,
  onClose,
  scenario = 'A',
  stage = 'interests'
}) => {

  // ----------------------------------------------------------
  // Сообщения
  // ----------------------------------------------------------

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text:
        'Здравствуйте! Я ваш ИИ-помощник Карьерного Навигатора СПб. ' +
        'Я помогу разобраться в ваших интересах, подобрать ' +
        'профессиональные пробы и определить, какие направления ' +
        'стоит попробовать. Расскажите немного о себе: ' +
        'что вам нравится делать?',
      time: getCurrentTime()
    }
  ]);


  // ----------------------------------------------------------
  // Поле ввода
  // ----------------------------------------------------------

  const [inputVal, setInputVal] = useState('');


  // ----------------------------------------------------------
  // Состояние загрузки
  // ----------------------------------------------------------

  const [isLoading, setIsLoading] = useState(false);


  // ----------------------------------------------------------
  // Рекомендация
  // ----------------------------------------------------------

  const [recommendation, setRecommendation] =
    useState(null);


  // ----------------------------------------------------------
  // Ошибка
  // ----------------------------------------------------------

  const [error, setError] = useState(null);


  // ----------------------------------------------------------
  // Ссылка на контейнер сообщений
  // ----------------------------------------------------------

  const messagesEndRef = useRef(null);


  // ----------------------------------------------------------
  // Автоматически прокручиваем чат вниз
  // ----------------------------------------------------------

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messages, isLoading]);


  // ==========================================================
  // ОТПРАВКА СООБЩЕНИЯ
  // ==========================================================

  const handleSend = async (textToSend = null) => {

    const text =
      textToSend !== null
        ? textToSend
        : inputVal;


    // Нельзя отправлять пустое сообщение
    if (!text.trim()) {
      return;
    }


    // Пока предыдущий запрос выполняется —
    // новый не отправляем
    if (isLoading) {
      return;
    }


    const cleanText = text.trim();


    // --------------------------------------------------------
    // Добавляем сообщение пользователя
    // --------------------------------------------------------

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: cleanText,
      time: getCurrentTime()
    };


    setMessages((prev) => [
      ...prev,
      userMessage
    ]);


    // Очищаем поле
    setInputVal('');


    // Сбрасываем предыдущую ошибку
    setError(null);


    // Показываем загрузку
    setIsLoading(true);


    try {

      // ------------------------------------------------------
      // Формируем историю диалога
      // ------------------------------------------------------

      const history = messages.map((message) => ({
        role:
          message.sender === 'ai'
            ? 'assistant'
            : 'user',

        content: message.text
      }));


      // ------------------------------------------------------
      // Отправляем запрос на FastAPI
      // ------------------------------------------------------

      const response = await fetch(
        `${API_URL}/api/assistant/chat`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(localStorage.getItem('career_token')
              ? { Authorization: `Bearer ${localStorage.getItem('career_token')}` }
              : {})
          },

          body: JSON.stringify({
            message: cleanText,

            history: history,

            scenario: scenario,

            stage: stage
          })
        }
      );


      // ------------------------------------------------------
      // Проверяем HTTP-ответ
      // ------------------------------------------------------

      if (!response.ok) {

        let errorMessage =
          `Ошибка сервера: ${response.status}`;

        try {

          const errorData =
            await response.json();

          if (errorData?.detail) {
            errorMessage =
              errorData.detail;
          }

        } catch {
          // Оставляем стандартную ошибку
        }

        throw new Error(errorMessage);
      }


      // ------------------------------------------------------
      // Получаем JSON от FastAPI
      // ------------------------------------------------------

      const data = await response.json();


      // ------------------------------------------------------
      // Проверяем наличие ответа
      // ------------------------------------------------------

      if (!data.answer) {

        throw new Error(
          'Backend не вернул поле answer'
        );

      }


      // ------------------------------------------------------
      // Если backend прислал рекомендацию
      // ------------------------------------------------------

      if (data.recommendation) {

        setRecommendation(
          data.recommendation
        );

      }


      // ------------------------------------------------------
      // Добавляем ответ AI
      // ------------------------------------------------------

      const aiMessage = {
        id: Date.now() + 1,

        sender: 'ai',

        text: data.answer,

        time: getCurrentTime()
      };


      setMessages((prev) => [
        ...prev,
        aiMessage
      ]);


    } catch (err) {

      console.error(
        'Ошибка подключения к AI:',
        err
      );


      setError(
        err?.message ||
        'Не удалось подключиться к ИИ-помощнику'
      );


      // ------------------------------------------------------
      // Показываем понятное сообщение пользователю
      // ------------------------------------------------------

      const errorMessage = {
        id: Date.now() + 1,

        sender: 'ai',

        text:
          'Не удалось получить ответ от ИИ-помощника. ' +
          'Проверьте, что FastAPI и Ollama запущены, ' +
          'и попробуйте ещё раз.',

        time: getCurrentTime()
      };


      setMessages((prev) => [
        ...prev,
        errorMessage
      ]);


    } finally {

      setIsLoading(false);

    }

  };


  // ==========================================================
  // ENTER
  // ==========================================================

  const handleKeyDown = (event) => {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();

    }

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      style={
        isModal
          ? styles.modalWrapper
          : styles.pageWrapper
      }
      className="animate-fade-in"
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.chatHeader}>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >

          <div style={styles.botAvatar}>

            <IconBot
              size={24}
              color="#ffffff"
            />

          </div>


          <div>

            <h3
              style={{
                margin: 0,
                fontSize: '1.15rem',
                color: '#0a2540'
              }}
            >
              ИИ-Ассистент
            </h3>


            <span
              style={{
                fontSize: '0.78rem',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >

              <span
                style={styles.onlineDot}
              />

              Онлайн • Карьерный навигатор

            </span>

          </div>

        </div>

      </div>


      {/* ======================================================
          MESSAGES
      ====================================================== */}

      <div style={styles.messagesContainer}>

        {messages.map((message) => {

          const isAi =
            message.sender === 'ai';


          return (

            <div
              key={message.id}
              style={{
                ...styles.messageRow,

                justifyContent:
                  isAi
                    ? 'flex-start'
                    : 'flex-end'
              }}
            >

              {/* Иконка AI */}

              {isAi && (

                <div
                  style={styles.smallBotIcon}
                >

                  <IconBot
                    size={16}
                    color="#ffffff"
                  />

                </div>

              )}


              {/* Сообщение */}

              <div
                style={{
                  ...styles.bubble,

                  ...(isAi
                    ? styles.aiBubble
                    : styles.userBubble)
                }}
              >

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word'
                  }}
                >
                  {message.text}
                </p>


                <span
                  style={styles.timeTag}
                >
                  {message.time}
                </span>

              </div>

            </div>

          );

        })}


        {/* ====================================================
            LOADING
        ==================================================== */}

        {isLoading && (

          <div
            style={{
              ...styles.messageRow,
              justifyContent: 'flex-start'
            }}
          >

            <div
              style={styles.smallBotIcon}
            >

              <IconBot
                size={16}
                color="#ffffff"
              />

            </div>


            <div
              style={{
                ...styles.bubble,
                ...styles.aiBubble
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >

                <span
                  style={styles.loadingDot}
                />

                <span
                  style={styles.loadingDot}
                />

                <span
                  style={styles.loadingDot}
                />

                <span
                  style={{
                    marginLeft: '5px',
                    color: '#64748b',
                    fontSize: '0.85rem'
                  }}
                >
                  Думаю...
                </span>

              </div>

            </div>

          </div>

        )}


        {/* Якорь для автоматического скролла */}

        <div
          ref={messagesEndRef}
        />

      </div>


      {/* ======================================================
          RECOMMENDATION
      ====================================================== */}

      {recommendation && (

        <div
          style={styles.recommendationCard}
        >

          <div
            style={
              styles.recommendationLabel
            }
          >
            ✨ РЕКОМЕНДАЦИЯ ИИ
          </div>


          <div
            style={
              styles.recommendationTitle
            }
          >
            {recommendation.title}
          </div>


          <div
            style={
              styles.recommendationText
            }
          >
            {recommendation.text}
          </div>


          {recommendation.type && (

            <div
              style={
                styles.recommendationType
              }
            >
              {getRecommendationType(
                recommendation.type
              )}
            </div>

          )}

        </div>

      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          style={styles.errorBox}
        >

          <span>
            ⚠️
          </span>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================================
          QUICK SUGGESTIONS
      ====================================================== */}

      <div
        style={
          styles.quickSuggestionsRow
        }
      >

        <div
          style={{
            fontSize: '0.78rem',
            color: '#64748b',
            fontWeight: 600,
            width: '100%',
            marginBottom: '4px'
          }}
        >
          Быстрые вопросы:
        </div>


        {QUICK_SUGGESTIONS.map(
          (chip, index) => (

            <button
              key={index}

              style={{
                ...styles.chipBtn,

                ...(isLoading
                  ? styles.disabledButton
                  : {})
              }}

              onClick={() =>
                handleSend(chip)
              }

              disabled={isLoading}
            >

              <IconSparkles
                size={13}
                color="#0066ff"
              />

              <span>
                {chip}
              </span>

            </button>

          )
        )}

      </div>


      {/* ======================================================
          INPUT
      ====================================================== */}

      <div style={styles.inputArea}>

        <input
          type="text"

          placeholder={
            isLoading
              ? 'ИИ формирует ответ...'
              : 'Напишите сообщение...'
          }

          value={inputVal}

          onChange={(event) =>
            setInputVal(event.target.value)
          }

          onKeyDown={handleKeyDown}

          disabled={isLoading}

          style={{
            ...styles.textInput,

            ...(isLoading
              ? styles.disabledInput
              : {})
          }}
        />


        <button
          className="btn btn-primary"

          onClick={() =>
            handleSend()
          }

          disabled={
            isLoading ||
            !inputVal.trim()
          }

          style={{
            ...styles.sendBtn,

            opacity:
              isLoading ||
              !inputVal.trim()
                ? 0.5
                : 1
          }}
        >

          <IconSend
            size={17}
            color="#ffffff"
          />

        </button>

      </div>

    </div>

  );

};


// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function getCurrentTime() {

  return new Date().toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );

}


function getRecommendationType(type) {

  switch (type) {

    case 'professional_trial':
      return 'Профессиональная проба';

    case 'direction':
      return 'Профессиональное направление';

    case 'profession':
      return 'Профессия для исследования';

    case 'next_step':
      return 'Следующий шаг';

    default:
      return 'Рекомендация';

  }

}


// ============================================================
// FLOATING AI ASSISTANT
// ============================================================

export const AiAssistantWidget = () => {

  const [isOpen, setIsOpen] =
    useState(false);


  return (

    <>

      {/* ====================================================
          FLOATING BUTTON
      ==================================================== */}

      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }

        style={styles.floatingBtn}

        title="ИИ-Помощник Карьерного Навигатора"

        aria-label="Открыть ИИ-помощника"
      >

        <IconBot
          size={28}
          color="#ffffff"
        />

        <span
          style={styles.pulseRing}
        />

      </button>


      {/* ====================================================
          FLOATING WINDOW
      ==================================================== */}

      {isOpen && (

        <div
          style={styles.floatingWindow}
        >

          <div
            style={styles.floatingHeader}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >

              <IconBot
                size={18}
                color="#ffffff"
              />

              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#ffffff'
                }}
              >
                Чат с ИИ-Ассистентом
              </span>

            </div>


            <button
              onClick={() =>
                setIsOpen(false)
              }

              style={styles.closeBtn}

              aria-label="Закрыть чат"
            >
              ✕
            </button>

          </div>


          <AiChatWindow
            isModal={true}

            onClose={() =>
              setIsOpen(false)
            }
          />

        </div>

      )}

    </>

  );

};


// ============================================================
// STYLES
// ============================================================

const styles = {

  // ----------------------------------------------------------
  // Основное окно
  // ----------------------------------------------------------

  pageWrapper: {

    backgroundColor: '#ffffff',

    borderRadius: '20px',

    border: '1px solid #e2e8f0',

    boxShadow:
      '0 8px 25px rgba(0,0,0,0.07)',

    overflow: 'hidden',

    display: 'flex',

    flexDirection: 'column',

    height: '700px',

    maxWidth: '1000px',

    width: '100%',

    margin: '0 auto'

  },


  // ----------------------------------------------------------
  // Модальное окно
  // ----------------------------------------------------------

  modalWrapper: {

    height: '700px',

    display: 'flex',

    flexDirection: 'column',

    backgroundColor: '#ffffff',

    width: '100%',

    minHeight: 0

  },


  // ----------------------------------------------------------
  // Header
  // ----------------------------------------------------------

  chatHeader: {

    backgroundColor: '#f8fafc',

    padding: '16px 22px',

    borderBottom:
      '1px solid #e2e8f0',

    flexShrink: 0

  },


  botAvatar: {

    width: '42px',

    height: '42px',

    borderRadius: '12px',

    backgroundColor: '#0066ff',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center'

  },


  onlineDot: {

    width: '7px',

    height: '7px',

    borderRadius: '50%',

    backgroundColor: '#10b981'

  },


  // ----------------------------------------------------------
  // Messages
  // ----------------------------------------------------------

  messagesContainer: {

    flex: 1,

    minHeight: 0,

    padding: '22px',

    overflowY: 'auto',

    display: 'flex',

    flexDirection: 'column',

    gap: '15px',

    backgroundColor: '#f8fafc'

  },


  messageRow: {

    display: 'flex',

    alignItems: 'flex-end',

    gap: '9px',

    width: '100%'

  },


  smallBotIcon: {

    width: '30px',

    height: '30px',

    borderRadius: '50%',

    backgroundColor: '#0066ff',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    flexShrink: 0

  },


  bubble: {

    maxWidth: '82%',

    padding: '13px 16px',

    borderRadius: '16px',

    position: 'relative',

    boxSizing: 'border-box'

  },


  aiBubble: {

    backgroundColor: '#ffffff',

    color: '#0f172a',

    border:
      '1px solid #e2e8f0',

    borderBottomLeftRadius: '4px',

    boxShadow:
      '0 2px 6px rgba(0,0,0,0.03)'

  },


  userBubble: {

    backgroundColor: '#0a2540',

    color: '#ffffff',

    borderBottomRightRadius: '4px'

  },


  timeTag: {

    display: 'block',

    fontSize: '0.68rem',

    opacity: 0.6,

    textAlign: 'right',

    marginTop: '5px'

  },


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  loadingDot: {

    width: '6px',

    height: '6px',

    borderRadius: '50%',

    backgroundColor: '#94a3b8',

    display: 'inline-block'

  },


  // ----------------------------------------------------------
  // Recommendation
  // ----------------------------------------------------------

  recommendationCard: {

    margin:
      '0 18px 12px 18px',

    padding: '15px 16px',

    background:
      'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',

    border:
      '1px solid #bfdbfe',

    borderRadius: '15px',

    boxShadow:
      '0 2px 8px rgba(0,102,255,0.08)',

    flexShrink: 0

  },


  recommendationLabel: {

    fontSize: '0.7rem',

    color: '#0066ff',

    fontWeight: 800,

    letterSpacing: '0.03em',

    marginBottom: '6px'

  },


  recommendationTitle: {

    fontSize: '0.95rem',

    fontWeight: 800,

    color: '#0a2540',

    marginBottom: '6px'

  },


  recommendationText: {

    fontSize: '0.82rem',

    color: '#475569',

    lineHeight: 1.5

  },


  recommendationType: {

    display: 'inline-block',

    marginTop: '9px',

    padding: '4px 9px',

    borderRadius: '10px',

    backgroundColor: '#ffffff',

    color: '#0066ff',

    fontSize: '0.7rem',

    fontWeight: 700,

    border:
      '1px solid #bfdbfe'

  },


  // ----------------------------------------------------------
  // Error
  // ----------------------------------------------------------

  errorBox: {

    margin:
      '0 18px 10px 18px',

    padding: '9px 12px',

    borderRadius: '10px',

    backgroundColor: '#fff7ed',

    border:
      '1px solid #fed7aa',

    color: '#9a3412',

    fontSize: '0.75rem',

    display: 'flex',

    gap: '7px',

    alignItems: 'flex-start',

    flexShrink: 0

  },


  // ----------------------------------------------------------
  // Quick suggestions
  // ----------------------------------------------------------

  quickSuggestionsRow: {
    padding: '14px 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #f1f5f9',

    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',

    // Увеличиваем область быстрых вопросов
    minHeight: '90px',
    maxHeight: '200px',

    // Если вопросов много — появляется прокрутка
    overflowY: 'auto',

    // Чтобы блок не сжимался
    flexShrink: 0,

    // Небольшой отступ снизу
    boxSizing: 'border-box'
  },

  chipBtn: {

    display: 'flex',

    alignItems: 'center',

    gap: '5px',

    backgroundColor: '#f0f9ff',

    border:
      '1px solid #bae6fd',

    borderRadius: '16px',

    padding: '5px 11px',

    fontSize: '0.76rem',

    color: '#0369a1',

    cursor: 'pointer'

  },


  // ----------------------------------------------------------
  // Input
  // ----------------------------------------------------------

  inputArea: {

    display: 'flex',

    gap: '9px',

    padding: '14px 18px',

    backgroundColor: '#ffffff',

    borderTop:
      '1px solid #e2e8f0',

    flexShrink: 0

  },


  textInput: {

    flex: 1,

    border:
      '1px solid #cbd5e1',

    borderRadius: '22px',

    padding: '11px 17px',

    fontSize: '0.9rem',

    outline: 'none',

    minWidth: 0,

    height: '44px',

    boxSizing: 'border-box'

  },


  sendBtn: {

    borderRadius: '50%',

    width: '44px',

    height: '44px',

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


  // ----------------------------------------------------------
  // Floating button
  // ----------------------------------------------------------

  floatingBtn: {

    position: 'fixed',

    bottom: '24px',

    right: '24px',

    width: '60px',

    height: '60px',

    borderRadius: '50%',

    backgroundColor: '#0a2540',

    boxShadow:
      '0 7px 22px rgba(10, 37, 64, 0.35)',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    zIndex: 999,

    cursor: 'pointer',

    border:
      '2px solid #00b4d8'

  },


  pulseRing: {

    position: 'absolute',

    width: '100%',

    height: '100%',

    borderRadius: '50%',

    border:
      '2px solid #0066ff',

    animation:
      'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',

    opacity: 0.75,

    pointerEvents: 'none'

  },


  // ----------------------------------------------------------
  // Floating window
  // ----------------------------------------------------------

  floatingWindow: {

    position: 'fixed',

    bottom: '98px',

    right: '24px',

    width: '500px',

    height: '720px',

    maxWidth:
      'calc(100vw - 32px)',

    maxHeight:
      'calc(100vh - 120px)',

    borderRadius: '20px',

    boxShadow:
      '0 15px 45px rgba(0,0,0,0.22)',

    zIndex: 999,

    overflow: 'hidden',

    border:
      '1px solid #cbd5e1',

    backgroundColor: '#ffffff',

    display: 'flex',

    flexDirection: 'column'

  },


  floatingHeader: {

    backgroundColor: '#0a2540',

    padding: '14px 18px',

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    minHeight: '52px',

    boxSizing: 'border-box',

    flexShrink: 0

  },


  closeBtn: {

    color: '#ffffff',

    fontSize: '1.1rem',

    cursor: 'pointer',

    background: 'none',

    border: 'none',

    padding: '3px 5px',

    lineHeight: 1

  }

};