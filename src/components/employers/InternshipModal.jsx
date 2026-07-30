import React, { useState } from 'react';
import { IconClose, IconCheck, IconBriefcase, IconSparkles } from '../common/Icons';

export const InternshipModal = ({ vacancy, companyName, isOpen, onClose }) => {
  const [applied, setApplied] = useState(false);

  if (!isOpen || !vacancy) return null;

  const handleConfirm = () => {
    setApplied(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <div>
            <span className="badge badge-primary">{companyName}</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', color: '#0a2540' }}>
              Отклик на позицию: {vacancy.title}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><IconClose size={18} color="#64748b" /></button>
        </div>

        {!applied ? (
          <div style={{ marginTop: '20px' }}>
            <div style={{ backgroundColor: '#f0f9ff', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>
                Условия: {vacancy.salary} • {vacancy.type}
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.45, marginBottom: '20px' }}>
              Ваш цифровой профиль (результаты ИИ-диагностики 94% IT, пройденные пробы АИТУ) будет автоматически прикреплен к заявке в компанию {companyName}.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                <IconSparkles size={16} /> Отправить отклик ИИ
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 10px' }} className="animate-fade-in">
            <IconCheck size={50} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#0a2540', margin: '0 0 8px 0' }}>Отклик успешно отправлен!</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
              Представитель HR компании {companyName} свяжется с Вами через личный кабинет.
            </p>
            <button className="btn btn-navy" onClick={onClose}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
};
