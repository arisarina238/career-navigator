import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconUser, 
  IconBrain, 
  IconMapPin, 
  IconCheck, 
  IconCalendar, 
  IconAward, 
  IconShield 
} from '../common/Icons';

export const ParentView = ({ activeTab }) => {
  const [approvedTrial, setApprovedTrial] = useState(false);
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    api.getParentApprovals()
      .then((data) => {
        if (Array.isArray(data)) {
          setApprovals(data);
          const hasPending = data.some((a) => a.status === 'PENDING');
          setApprovedTrial(!hasPending);
        }
      })
      .catch((err) => console.warn('Using local approvals fallback', err));
  }, []);

  const handleApprove = async () => {
    if (approvals.length > 0) {
      const pending = approvals.find((a) => a.status === 'PENDING');
      if (pending) {
        try {
          await api.respondParentApproval(pending.id, 'APPROVED');
        } catch (err) {
          console.warn('Could not submit approval to API:', err.message);
        }
      }
    }
    setApprovedTrial(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Parent Hero Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)', color: '#ffffff', borderRadius: '24px', boxShadow: '0 12px 30px rgba(120, 53, 15, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fde68a' }}>
              Кабинет Родителя (Законного Представителя)
            </span>
            <h2 style={{ color: '#ffffff', margin: '8px 0 4px 0', fontSize: '1.45rem' }}>
              Михаил Анатольевич Смирнов • Ребёнок: Александр (9 "Б")
            </h2>
            <p style={{ color: '#fef3c7', margin: 0, fontSize: '0.85rem' }}>
              ГБОУ СОШ №214 • Связано через аккаунт ЕСИА Госуслуги родителя
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: '14px', fontSize: '0.82rem' }}>
            <IconShield size={16} color="#fde68a" />
            <span>ЕСИА Связь активна</span>
          </div>
        </div>
      </div>

      {/* PAGE 1: TAB 'profile' (Кабинет Родителя) */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Metric Cards for Parent */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBrain size={22} color="#0066ff" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0066ff' }}>94% IT</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Главная склонность</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconMapPin size={22} color="#ff9f1c" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff9f1c' }}>2 пробы</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Запланировано в АИТУ</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{approvedTrial ? '2 из 2' : '1 из 2'}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Согласовано родителем</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', marginBottom: '12px' }}>
              👨‍👩‍👦 Обзор активности ребёнка в навигаторе
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Александр успешно завершил этап психологической диагностики (Холланд/RIASEC) и зачислен на 2 практические пробы. Вы имеете право согласовать выезды за пределы школы.
            </p>
          </div>
        </div>
      )}

      {/* PAGE 2: TAB 'diagnostics' (Результаты тестов ребенка) */}
      {activeTab === 'diagnostics' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px' }}>
            📊 Подробный отчёт психолога-профориентатора для родителей
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>ВЫЯВЛЕННЫЕ ИНТЕРЕСЫ (RIASEC)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0066ff', margin: '4px 0 8px 0' }}>
                Информационные технологии (94%)
              </div>
              <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Александр демонстрирует высокий потенциал в программировании и алгоритмах. Рекомендуется профильное направление в колледжах СПб или СПбПУ.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>СКУЛЬПТУРА ИНЖЕНЕРНЫХ НАВЫКОВ</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', margin: '4px 0 8px 0' }}>
                Инженерия & ЧПУ (87%)
              </div>
              <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Развитые пространственные и конструкторские способности. Посещение пробы ЧПУ 06.08 укрепит интерес.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 3: TAB 'map' (Согласование выездов) */}
      {activeTab === 'map' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', margin: 0 }}>
              📝 Согласование выездных практических мероприятий
            </h3>
            <span className="badge badge-gold">{approvedTrial ? 'Все выезды одобрены' : 'Требует подписи (1)'}</span>
          </div>

          {!approvedTrial ? (
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#78350f', marginBottom: '4px' }}>
                  Выездная профпроба «3D-моделирование и печать деталей на ЧПУ»
                </div>
                <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '4px' }}>
                  📍 Площадка: Инженерный корпус АИТУ (м. Кировский завод, ул. Профсоюзная 14)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#b45309' }}>
                  📅 Дата: 06 августа 2026, 12:00 (Длительность: 2.5 часа) • Сопровождающий педагог: Волкова Е.С.
                </div>
              </div>

              <button className="btn btn-gold" onClick={handleApprove} style={{ padding: '12px 20px', fontSize: '0.9rem' }}>
                <IconCheck size={16} /> Подтвердить согласие
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#065f46' }}>
              <IconCheck size={24} color="#10b981" />
              <div>
                <strong style={{ fontSize: '0.98rem' }}>Согласие родителя успешно зафиксировано!</strong>
                <div style={{ fontSize: '0.82rem' }}>Александр Смирнов зачислен в группу выезда 06.08.2026. Уведомление отправлено наставнику.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAGE 4: TAB 'roadmap' (Календарь выездов) */}
      {activeTab === 'roadmap' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px' }}>
            🗓️ Семейный календарь зачисленных мероприятий ребёнка
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0a2540' }}>05.08.2026 (14:00) — Проба «React Web Dev»</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>АИТУ СПб, ул. Профсоюзная 14 (м. Технологический институт)</div>
              </div>
              <span className="badge badge-success">Согласовано</span>
            </li>

            <li style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0a2540' }}>06.08.2026 (12:00) — Проба «3D Печать ЧПУ»</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Инженерный корпус АИТУ (м. Кировский завод)</div>
              </div>
              <span className={`badge ${approvedTrial ? 'badge-success' : 'badge-gold'}`}>
                {approvedTrial ? 'Согласовано' : 'Ожидает согласия'}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
