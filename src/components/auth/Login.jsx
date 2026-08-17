import React, { useState } from 'react';
import { IconUser, IconLock, IconArrowRight, IconShield, IconCareer } from '../common/Icons';

export const Login = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Заполните все обязательные поля.');
      return;
    }

    if (onLogin) {
      onLogin({ email: email.trim(), role });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.authCard}>
        <div style={styles.logoBlock}>
          <div style={styles.logoIcon}>
            <IconCareer size={28} color="#ffffff" />
          </div>
          <div>
            <div style={styles.logoTitle}>КАРЬЕРНЫЙ НАВИГАТОР</div>
            <div style={styles.logoSubtitle}>Санкт-Петербург</div>
          </div>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Вход в систему</h1>
          <p style={styles.subtitle}>Продолжите свой путь от школы к профессии</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Электронная почта</label>
            <div style={styles.inputWrapper}>
              <IconUser size={18} color="#64748b" />
              <input
                type="email"
                placeholder="Введите электронную почту"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Пароль</label>
            <div style={styles.inputWrapper}>
              <IconLock size={18} color="#64748b" />
              <input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="participant">Участник (школьник)</option>
              <option value="parent">Родитель</option>
              <option value="mentor">Наставник</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <div style={styles.optionsRow}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} />
              <span>Запомнить меня</span>
            </label>
            <button type="button" style={styles.forgotButton}>Забыли пароль?</button>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" style={styles.submitButton}>
            <span>Войти</span>
            <IconArrowRight size={18} color="#ffffff" />
          </button>
        </form>

        <div style={styles.registerBlock}>
          <span>Ещё нет аккаунта?</span>
          <button type="button" onClick={onGoToRegister} style={styles.registerButton}>
            Зарегистрироваться
          </button>
        </div>

        <div style={styles.infoBlock}>
          <div style={styles.infoIcon}>
            <IconShield size={18} color="#6ee7b7" />
          </div>
          <div>
            <div style={styles.infoTitle}>Безопасный вход</div>
            <div style={styles.infoText}>
              В рабочей версии авторизация будет интегрирована с порталом «Работа в России» и Госуслугами.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px'
  },
  authCard: {
    width: '100%',
    maxWidth: '470px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 12px 40px rgba(10, 37, 64, 0.10)',
    padding: '36px'
  },
  logoBlock: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px'
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    backgroundColor: '#0a2540',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  logoTitle: {
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#0a2540',
    letterSpacing: '0.02em'
  },
  logoSubtitle: {
    fontSize: '0.72rem',
    color: '#64748b',
    marginTop: '2px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  title: {
    margin: '0 0 8px 0',
    color: '#0a2540',
    fontSize: '1.65rem',
    fontWeight: 800
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.88rem',
    lineHeight: 1.5
  },
  field: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    marginBottom: '7px',
    color: '#334155',
    fontSize: '0.82rem',
    fontWeight: 700
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #cbd5e1',
    borderRadius: '11px',
    padding: '0 13px',
    height: '46px',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s ease'
  },
  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '0.88rem',
    color: '#0f172a',
    backgroundColor: 'transparent'
  },
  select: {
    width: '100%',
    height: '46px',
    border: '1px solid #cbd5e1',
    borderRadius: '11px',
    padding: '0 13px',
    outline: 'none',
    fontSize: '0.88rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#64748b',
    fontSize: '0.78rem',
    cursor: 'pointer'
  },
  checkbox: {
    accentColor: '#0066ff',
    cursor: 'pointer'
  },
  forgotButton: {
    border: 'none',
    background: 'none',
    color: '#0066ff',
    fontSize: '0.78rem',
    cursor: 'pointer',
    padding: 0
  },
  submitButton: {
    width: '100%',
    height: '48px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '11px',
    fontSize: '0.9rem',
    fontWeight: 700,
    backgroundColor: '#0066ff',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '10px',
    padding: '10px 12px',
    marginBottom: '15px',
    color: '#9a3412',
    fontSize: '0.78rem'
  },
  registerBlock: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    marginTop: '22px',
    fontSize: '0.82rem',
    color: '#64748b'
  },
  registerButton: {
    border: 'none',
    background: 'none',
    color: '#0066ff',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0
  },
  infoBlock: {
    display: 'flex',
    gap: '10px',
    marginTop: '25px',
    padding: '13px',
    borderRadius: '11px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  infoIcon: {
    fontSize: '18px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center'
  },
  infoTitle: {
    color: '#334155',
    fontSize: '0.76rem',
    fontWeight: 700,
    marginBottom: '3px'
  },
  infoText: {
    color: '#64748b',
    fontSize: '0.7rem',
    lineHeight: 1.4
  }
};