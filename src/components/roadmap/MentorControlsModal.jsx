import React, { useState } from 'react';
import { IconClose, IconCheck, IconUser } from '../common/Icons';

export const MentorControlsModal = ({ isOpen, onClose }) => {
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <div>
            <span className="badge badge-primary">Модуль Наставника МКЦ</span>
            <h3 style={{ margin: '4px 0 0 0', color: '#0a2540', fontSize: '1.2rem' }}>
              Корректировка Образовательного Маршрута
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IconClose size={18} color="#64748b" /></button>
        </div>

        {!saved ? (
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.45, marginBottom: '14px' }}>
              Как педагогический наставник ГБОУ СОШ №214, вы имеете доступ к ручной корректировке ИИ-маршрутов учеников класса 9 "Б".
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
                Педагогическое заключение и рекомендации:
              </label>
              <textarea
                rows={4}
                placeholder="Внесите рекомендации педагогического совета по выбору СПО/ВУЗа..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <IconCheck size={16} /> Сохранить изменения
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 10px' }} className="animate-fade-in">
            <IconCheck size={48} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#0a2540', margin: 0 }}>Изменения успешно сохранены!</h3>
          </div>
        )}
      </div>
    </div>
  );
};
