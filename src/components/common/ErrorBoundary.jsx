import React from 'react';
import { IconShield } from './Icons';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.removeItem('career_token');
    localStorage.removeItem('career_user');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '40px 32px',
            maxWidth: '520px',
            boxShadow: '0 10px 30px rgba(10, 37, 64, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <IconShield size={48} color="#0066ff" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#0a2540', marginBottom: '12px', fontSize: '1.4rem' }}>
              Произошла временная ошибка отображения
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Сессия обновлена. Нажмите кнопку ниже, чтобы обновить страницу и войти в профиль.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={this.handleReload}>
                Обновить страницу
              </button>
              <button className="btn btn-secondary" onClick={this.handleReset}>
                Сбросить сессию и войти снова
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
