import React from 'react';
import { X, ShieldCheck, Lock, Eye, UserCheck, Key } from 'lucide-react';

export const PermissionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={26} color="#0284c7" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0b2265' }}>Безопасность и Права Доступа (ФЗ-152)</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Разграничение прав доступа к Цифровому профилю Санкт-Петербурга
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={styles.schemeCard}>
            <div style={styles.schemeHeader}>
              <UserCheck size={18} color="#10b981" />
              <strong>Сам Участник (Школьник)</strong>
            </div>
            <p style={styles.schemeDesc}>Полный доступ. Просмотр и редактирование всех данных, пройденных тестов и сохраненных маршрутов.</p>
          </div>

          <div style={styles.schemeCard}>
            <div style={styles.schemeHeader}>
              <Eye size={18} color="#f59e0b" />
              <strong>Родитель (Законный представитель)</strong>
            </div>
            <p style={styles.schemeDesc}>Просмотр прогресса и результатов диагностики ребёнка. Доступ открывается после связывания аккаунтов на Госуслугах.</p>
          </div>

          <div style={styles.schemeCard}>
            <div style={styles.schemeHeader}>
              <Key size={18} color="#0284c7" />
              <strong>Наставник (АИТУ / МЦК / Школа)</strong>
            </div>
            <p style={styles.schemeDesc}>Доступ к учебной части закрепленной группы: результаты тестов, история проб, возможность корректировки маршрута.</p>
          </div>

          <div style={styles.schemeCard}>
            <div style={styles.schemeHeader}>
              <Lock size={18} color="#64748b" />
              <strong>Администратор «Работа в России» / Работодатели</strong>
            </div>
            <p style={styles.schemeDesc}>Административный доступ к обезличенной статистике для мониторинга или с прямого согласия участника при отклике на стажировку.</p>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>Понятно</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px'
  },
  closeBtn: {
    padding: '6px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    cursor: 'pointer'
  },
  schemeCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0'
  },
  schemeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#0f172a',
    marginBottom: '4px'
  },
  schemeDesc: {
    margin: 0,
    fontSize: '0.82rem',
    color: '#475569',
    lineHeight: 1.4
  }
};
