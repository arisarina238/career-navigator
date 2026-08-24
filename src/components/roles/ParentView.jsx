import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconBrain, 
  IconMapPin, 
  IconCheck, 
  IconCalendar, 
  IconShield,
  IconSparkles
} from '../common/Icons';

export const ParentView = ({ activeTab }) => {
  const [parentInfo, setParentInfo] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadParentData = () => {
    setLoading(true);
    Promise.all([
      api.getParentProfile().catch(() => null),
      api.getParentApprovals().catch(() => [])
    ])
      .then(([pProfile, pApprovals]) => {
        if (pProfile) setParentInfo(pProfile);
        if (Array.isArray(pApprovals)) setApprovals(pApprovals);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParentData();
  }, []);

  const handleApprove = async (approvalId) => {
    try {
      await api.respondParentApproval(approvalId, 'APPROVED');
      setApprovals((prev) =>
        prev.map((a) => (a.id === approvalId ? { ...a, status: 'APPROVED' } : a))
      );
      loadParentData();
    } catch (err) {
      alert('Ошибка при согласовании: ' + err.message);
    }
  };

  const parentName = parentInfo?.name || 'Родитель (Законный представитель)';
  const children = parentInfo?.children || [];
  const primaryChild = children[0] || null;
  const childName = primaryChild ? `${primaryChild.name} (${primaryChild.grade})` : 'Ученик прикреплен';
  const childSchool = primaryChild?.school || 'ГБОУ СОШ Санкт-Петербурга';

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const approvedApprovals = approvals.filter((a) => a.status === 'APPROVED');
  const allApproved = pendingApprovals.length === 0;

  const childTopDirection = primaryChild?.diagnosticResult?.topDirections?.[0]?.name || 'IT & Аналитика данных';
  const childTopMatch = primaryChild?.diagnosticResult?.topDirections?.[0]?.match || 94;

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
              {parentName} • Ребёнок: {childName}
            </h2>
            <p style={{ color: '#fef3c7', margin: 0, fontSize: '0.85rem' }}>
              {childSchool} • Связано через аккаунт ЕСИА Госуслуги родителя
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
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0066ff' }}>{childTopMatch}% IT</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Главная склонность</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconMapPin size={22} color="#ff9f1c" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff9f1c' }}>{approvals.length} пробы</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Запланировано в АИТУ</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{approvedApprovals.length} из {approvals.length}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Согласовано родителем</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: '#0a2540', marginBottom: '12px' }}>
              👨‍👩‍👦 Обзор активности ребёнка: {primaryChild?.name || 'Ученик'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {primaryChild?.name || 'Ребёнок'} проходит этапы профориентации на платформе Санкт-Петербурга. Направление с наибольшим потенциалом: <strong>{childTopDirection}</strong>. Вы можете в один клик подтверждать согласия на выездные мероприятия за пределы школы.
            </p>
          </div>
        </div>
      )}

      {/* PAGE 2: TAB 'diagnostics' (Результаты тестов ребенка) */}
      {activeTab === 'diagnostics' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px' }}>
            📊 Подробный отчёт профориентации для родителей
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>ВЫЯВЛЕННЫЕ ИНТЕРЕСЫ (RIASEC)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0066ff', margin: '4px 0 8px 0' }}>
                {childTopDirection} ({childTopMatch}%)
              </div>
              <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Демонстрирует высокий потенциал в алгоритмах и цифровых продуктах. Рекомендуется профильное направление в колледжах СПб или ВУЗах-партнерах.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>ПРАКТИЧЕСКИЕ НАВЫКИ</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', margin: '4px 0 8px 0' }}>
                Инженерия & CAD (87%)
              </div>
              <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Развитые конструкторские и аналитические способности. Посещение практических проб в АИТУ закрепит интерес.
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
            <span className={`badge ${allApproved ? 'badge-success' : 'badge-gold'}`}>
              {allApproved ? 'Все выезды одобрены' : `Требует подписи (${pendingApprovals.length})`}
            </span>
          </div>

          {approvals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              {loading ? 'Загрузка согласований...' : 'Нет активных запросов на согласование.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {approvals.map((appr) => {
                const isPending = appr.status === 'PENDING';
                return (
                  <div 
                    key={appr.id} 
                    style={{ 
                      backgroundColor: isPending ? '#fffbeb' : '#ecfdf5', 
                      border: `1px solid ${isPending ? '#fde68a' : '#a7f3d0'}`, 
                      padding: '18px 20px', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '16px' 
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: isPending ? '#78350f' : '#065f46', marginBottom: '4px' }}>
                        {appr.title}
                      </div>
                      {appr.booking?.trial && (
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                          📍 Площадка: {appr.booking.trial.address} (Формат: {appr.booking.trial.format})
                        </div>
                      )}
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Ученик: <strong>{appr.student?.user?.fullName || primaryChild?.name}</strong> • Запрос: {new Date(appr.requestedAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    {isPending ? (
                      <button 
                        className="btn btn-gold" 
                        onClick={() => handleApprove(appr.id)} 
                        style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                      >
                        <IconCheck size={16} /> Подтвердить согласие
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                        <IconCheck size={18} color="#10b981" />
                        <span>Согласие подтверждено</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PAGE 4: TAB 'roadmap' (Календарь выездов) */}
      {activeTab === 'roadmap' && (
        <div className="card animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', color: '#0a2540', marginBottom: '14px' }}>
            🗓️ Семейный календарь мероприятий ребёнка
          </h3>
          {approvals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              Календарь пуст. Записи на профпробы появятся здесь.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {approvals.map((appr) => (
                <li key={appr.id} style={{ padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0a2540' }}>{appr.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {appr.booking?.trial?.address || 'АИТУ Санкт-Петербург'}
                    </div>
                  </div>
                  <span className={`badge ${appr.status === 'APPROVED' ? 'badge-success' : 'badge-gold'}`}>
                    {appr.status === 'APPROVED' ? 'Согласовано' : 'Ожидает согласия'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentView;
