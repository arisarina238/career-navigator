import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  IconCompass, 
  IconSearch, 
  IconBell, 
  IconShield, 
  IconClose, 
  IconCheck,
  IconSparkles
} from '../common/Icons';

export const Header = ({ 
  currentRole, 
  activeTab, 
  setActiveTab, 
  onStartTour, 
  currentUser,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    if (!currentUser) return;
    api.getNotifications()
      .then((data) => {
        if (data && Array.isArray(data.notifications)) {
          setNotificationsList(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [currentUser]);

  const handleMarkAllRead = () => {
    api.markAllNotificationsRead().then(() => {
      setUnreadCount(0);
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }).catch(() => {});
  };

  const getRoleLabel = (role) => {
    switch (role?.toUpperCase()) {
      case 'STUDENT': return 'Школьник';
      case 'MENTOR': return 'Наставник';
      case 'PARENT': return 'Родитель';
      case 'EMPLOYER': return 'Работодатель';
      case 'ADMIN': return 'Администратор';
      default: return 'Школьник';
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toUpperCase()) {
      case 'MENTOR': return { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
      case 'PARENT': return { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
      case 'EMPLOYER': return { backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' };
      default: return { backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' };
    }
  };

  return (
    <header style={styles.header}>
      {/* Top Gov Strip */}
      <div style={styles.topGovBar}>
        <div style={styles.topGovBarInner}>
          <div style={styles.govBrand}>
            <span style={styles.coatBadge}>СПб</span>
            <span>Служба занятости r21.spb.ru • Портал «Работа в России»</span>
          </div>

          <div style={styles.topGovRight}>
            <div style={styles.statusGosuTag}>
              <IconShield size={13} color="#6ee7b7" />
              <span>{currentUser?.gosuslugiVerified ? 'ЕСИА Госуслуги (Подтверждено)' : 'ЕСИА Госуслуги'}</span>
            </div>
            <button onClick={onStartTour} style={styles.tourPillBtn}>
              <IconSparkles size={13} color="#0066ff" /> Интерактивный тур
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div style={styles.mainHeaderRow}>
        {/* Brand */}
        <button 
          onClick={() => setActiveTab('profile')} 
          style={styles.brandBtn}
          title="На главную"
        >
          <div style={styles.logoBadge}>
            <IconCompass size={22} color="#ffffff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={styles.siteTitle}>КАРЬЕРНЫЙ НАВИГАТОР</h1>
            <p style={styles.siteSubtitle}>АИТУ • Санкт-Петербург</p>
          </div>
        </button>

        {/* Search */}
        <div style={styles.searchBox}>
          <IconSearch size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Поиск профпроб, ВУЗов СПб..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Actions & User State */}
        <div style={styles.headerRight}>
          {/* Notifications Button */}
          <div style={{ position: 'relative' }}>
            <button 
              style={styles.iconBtn} 
              onClick={() => setShowNotifications(!showNotifications)} 
              title="Уведомления"
            >
              <IconBell size={18} color="#0a2540" />
              {unreadCount > 0 && <span style={styles.bellDot} />}
            </button>

            {showNotifications && (
              <div style={styles.notifDropdown} className="animate-fade-in">
                <div style={styles.notifHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0a2540' }}>Уведомления</span>
                    {unreadCount > 0 && (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#0066ff', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', color: '#0066ff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Прочитать все
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} style={styles.closeBtn}>
                      <IconClose size={16} color="#64748b" />
                    </button>
                  </div>
                </div>
                <div style={styles.notifList}>
                  {notificationsList.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                      У вас нет новых уведомлений
                    </div>
                  ) : (
                    notificationsList.map((n) => (
                      <div key={n.id} style={{ ...styles.notifItem, backgroundColor: !n.isRead ? '#f0f9ff' : '#ffffff' }}>
                        <IconCheck size={16} color={!n.isRead ? '#0066ff' : '#64748b'} />
                        <div>
                          <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: !n.isRead ? 600 : 400 }}>{n.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>{n.message}</div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                            {new Date(n.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Authentication Button */}
          {currentUser ? (
            <div style={styles.userProfileGroup}>
              <div style={{ ...styles.userRoleBadge, ...getRoleBadgeStyle(currentUser.role) }}>
                {getRoleLabel(currentUser.role)}
              </div>
              <button 
                onClick={() => setActiveTab('profile')}
                style={styles.avatarBtn}
                title={`Профиль: ${currentUser.fullName || 'Пользователь'}`}
              >
                <img 
                  src={currentUser.avatarUrl || currentRole?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={currentUser.fullName || currentRole?.name || 'Пользователь'} 
                  style={styles.avatarImg} 
                />
                <span style={styles.userNameHeader}>{currentUser.fullName || currentRole?.name || 'Пользователь'}</span>
              </button>
              <button 
                onClick={onLogout}
                style={styles.logoutBtn}
                title="Выйти из аккаунта"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setActiveTab('login')}
                style={styles.loginNavBtn}
              >
                Войти в систему
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 9000,
    boxShadow: '0 2px 8px rgba(10,37,64,0.04)'
  },
  topGovBar: {
    backgroundColor: '#0a2540',
    color: '#94a3b8',
    fontSize: '0.78rem',
    padding: '4px 0'
  },
  topGovBarInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px'
  },
  govBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  coatBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: 700,
    fontSize: '0.7rem'
  },
  topGovRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusGosuTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#6ee7b7',
    fontSize: '0.75rem'
  },
  tourPillBtn: {
    backgroundColor: '#ff9f1c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '2px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  mainHeaderRow: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    position: 'relative'
  },
  brandBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0066ff 0%, #00b4d8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
  },
  siteTitle: {
    fontSize: '1.15rem',
    letterSpacing: '-0.01em',
    color: '#0a2540',
    margin: 0
  },
  siteSubtitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: 0
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    width: '260px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative'
  },
  userRoleBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  },
  userNameHeader: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: '#0a2540'
  },
  iconBtn: {
    position: 'relative',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    border: 'none',
    cursor: 'pointer'
  },
  bellDot: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ff4d4f'
  },
  avatarBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  userProfileGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '16px',
    padding: '5px 12px',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  loginNavBtn: {
    backgroundColor: '#0066ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '18px',
    padding: '7px 16px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 102, 255, 0.25)',
    transition: 'all 0.2s ease'
  },
  avatarImg: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #0066ff'
  },
  notifDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '300px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 15px 35px rgba(10,37,64,0.25)',
    border: '1px solid #cbd5e1',
    zIndex: 99999,
    overflow: 'hidden'
  },
  notifHeader: {
    backgroundColor: '#f8fafc',
    padding: '10px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  notifList: {
    display: 'flex',
    flexDirection: 'column'
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 14px',
    borderBottom: '1px solid #f1f5f9'
  }
};
