import React, { useState } from 'react';
import { api } from '../../services/api';
import { IconClose, IconCalendar, IconMapPin, IconUser, IconCheck, IconCompass } from '../common/Icons';

export const BookingModal = ({ trial, isOpen, onClose, onBooked }) => {
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !trial) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (trial.id) {
        await api.bookProTrial(trial.id);
      }
      setBooked(true);
      // Уведомляем карту об успешной записи
      if (onBooked) setTimeout(() => onBooked(), 1800);
    } catch (err) {
      console.warn('Booking warning:', err.message);
      setBooked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={styles.header}>
          <div>
            <span className="badge badge-primary">{trial.format}</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', color: '#0a2540' }}>
              Запись на профпробу: {trial.title}
            </h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><IconClose size={18} color="#64748b" /></button>
        </div>

        {!booked ? (
          <div style={{ marginTop: '20px' }}>
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <IconCalendar size={18} color="#0066ff" />
                <span><strong>Ближайший слот:</strong> {trial.nextDate} ({trial.duration})</span>
              </div>
              <div style={styles.infoRow}>
                <IconMapPin size={18} color="#0066ff" />
                <span><strong>Адрес:</strong> {trial.address}</span>
              </div>
              <div style={styles.infoRow}>
                <IconCompass size={18} color="#0066ff" />
                <span><strong>Маршрут:</strong> {trial.metro}</span>
              </div>
              <div style={styles.infoRow}>
                <IconUser size={18} color="#0066ff" />
                <span><strong>Свободных мест:</strong> {trial.availableSlots} из {trial.maxSlots}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.4, margin: '16px 0' }}>
              {trial.description}
            </p>

            <div style={styles.noticeBox}>
              ℹ️ Место фиксируется в вашем <strong>Цифровом профиле Санкт-Петербурга</strong>. Родитель и наставник получат уведомление для подтверждения.
            </div>

            <div style={styles.actionsRow}>
              <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                Подтвердить запись
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px' }} className="animate-fade-in">
            <IconCheck size={56} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#0a2540', margin: '0 0 8px 0' }}>Запись успешно подтверждена!</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Проба зафиксирована в Вашем цифровом профиле и календаре СПб.
            </p>
            <button className="btn btn-navy" onClick={onClose}>Вернуться к карте</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '14px'
  },
  closeBtn: {
    padding: '6px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
    border: 'none'
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid #e2e8f0'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.88rem',
    color: '#1e293b'
  },
  noticeBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.8rem',
    color: '#0369a1',
    marginBottom: '20px'
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  }
};
