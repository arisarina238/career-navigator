import React, { useState } from 'react';
import { IconUser, IconLock, IconArrowRight, IconShield, IconCareer } from '../common/Icons';
import { api } from '../../services/api';

export const Register = ({ onRegister, onGoToLogin }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant',
    agree: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() ||
        !form.password.trim() || !form.confirmPassword.trim()) {
      setError('Заполните все обязательные поля.');
      return;
    }

    if (form.password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    if (!form.agree) {
      setError('Необходимо согласиться с условиями использования сервиса.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      });

      if (res && res.token && res.user) {
        api.setSession(res.token, res.user);
        if (onRegister) {
          onRegister(res.user);
        }
      } else {
        throw new Error('Некорректный ответ сервера при создании аккаунта.');
      }
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации. Проверьте данные.');
    } finally {
      setLoading(false);
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
          <h1 style={styles.title}>Создание аккаунта</h1>
          <p style={styles.subtitle}>Начните свой путь к осознанному выбору профессии</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Имя *</label>
            <div style={styles.inputWrapper}>
              <IconUser size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Введите имя"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Фамилия *</label>
            <div style={styles.inputWrapper}>
              <IconUser size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Введите фамилию"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Электронная почта *</label>
            <div style={styles.inputWrapper}>
              <IconUser size={18} color="#64748b" />
              <input
                type="email"
                placeholder="Введите электронную почту"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Выберите роль *</label>
            <select
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              style={styles.select}
              disabled={loading}
            >
              <option value="participant">Участник (школьник)</option>
              <option value="parent">Родитель (законный представитель)</option>
              <option value="mentor">Наставник / Куратор</option>
              <option value="employer">Работодатель / Представитель компании</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Пароль *</label>
            <div style={styles.inputWrapper}>
              <IconLock size={18} color="#64748b" />
              <input
                type="password"
                placeholder="Не менее 6 символов"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Подтвердите пароль *</label>
            <div style={styles.inputWrapper}>
              <IconLock size={18} color="#64748b" />
              <input
                type="password"
                placeholder="Повторите пароль"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                style={styles.input}
                disabled={loading}
                required
              />
            </div>
          </div>

          <label style={styles.agreement}>
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => handleChange('agree', e.target.checked)}
              style={styles.checkbox}
              disabled={loading}
            />
            <span>Я согласен с условиями использования сервиса и обработкой персональных данных</span>
          </label>

          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
            disabled={loading}
          >
            <span>{loading ? 'Создание учетной записи...' : 'Создать аккаунт'}</span>
            {!loading && <IconArrowRight size={18} color="#ffffff" />}
          </button>
        </form>

        <div style={styles.loginBlock}>
          <span>Уже есть аккаунт?</span>
          <button type="button" onClick={onGoToLogin} style={styles.loginButton}>
            Войти
          </button>
        </div>

        <div style={styles.infoBlock}>
          <div style={styles.infoIcon}>
            <IconShield size={18} color="#6ee7b7" />
          </div>
          <div>
            <div style={styles.infoTitle}>О защите данных</div>
            <div style={styles.infoText}>
              В рабочей версии регистрация будет интегрирована с системой авторизации портала «Работа в России».
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
    maxWidth: '500px',
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
    marginBottom: '30px'
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
    marginBottom: '25px'
  },
  title: {
    margin: '0 0 8px 0',
    color: '#0a2540',
    fontSize: '1.6rem',
    fontWeight: 800
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.88rem',
    lineHeight: 1.5
  },
  field: {
    marginBottom: '15px'
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
  agreement: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    color: '#64748b',
    fontSize: '0.74rem',
    lineHeight: 1.4,
    margin: '5px 0 18px 0',
    cursor: 'pointer'
  },
  checkbox: {
    marginTop: '2px',
    accentColor: '#0066ff',
    cursor: 'pointer',
    flexShrink: 0
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '10px',
    padding: '10px 12px',
    marginBottom: '15px',
    color: '#9a3412',
    fontSize: '0.78rem',
    lineHeight: 1.4
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
  loginBlock: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    marginTop: '22px',
    fontSize: '0.82rem',
    color: '#64748b'
  },
  loginButton: {
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
    marginTop: '24px',
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