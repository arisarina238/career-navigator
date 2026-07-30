import React, { useState } from 'react';
import { 
  IconCompass, 
  IconSearch, 
  IconBell, 
  IconShield, 
  IconChevronDown, 
  IconClose, 
  IconCheck 
} from '../common/Icons';

export const Header = ({ currentRole, activeTab, setActiveTab, onStartTour, rolesList, activeRoleId, onSelectRole }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationsList = [
    { id: 1, text: 'Вам зачислена проба «3D-моделирование на ЧПУ»', date: 'Сегодня, 14:20', isNew: true },
    { id: 2, text: 'Наставник Елена Сергеевна одобрила Ваш маршрут', date: 'Вчера, 18:05', isNew: false }
  ];

  return (
    <header style={styles.header}>
      {/* Top Gov Strip */}
      <div style={styles.topGovBar}>
        <div style={styles.topGovBarInner}>
          <div style={styles.govBrand}>
            <span style={styles.coatBadge}>🏛️ СПб</span>
            <span>Служба занятости r21.spb.ru • Портал «Работа в России»</span>
          </div>

          <div style={styles.topGovRight}>
            <div style={styles.statusGosuTag}>
              <IconShield size={13} color="#6ee7b7" />
              <span>ЕСИА Госуслуги</span>
            </div>
            <button onClick={onStartTour} style={styles.tourPillBtn}>
              ⚡ Интерактивный тур
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

        {/* Actions & Role Switcher */}
        <div style={styles.headerRight}>
          {/* Role Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifications(false);
              }}
              style={styles.roleSwitcherBtn}
            >
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Роль:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a2540' }}>{currentRole.title}</span>
              <IconChevronDown size={14} color="#64748b" />
            </button>

            {showRoleDropdown && (
              <div style={styles.roleDropdown} className="animate-fade-in">
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>
                  ВЫБОР РОЛИ ИНТЕРФЕЙСА:
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRole(r);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      ...styles.roleDropdownItem,
                      backgroundColor: r.id === activeRoleId ? '#f0f9ff' : 'transparent',
                      fontWeight: r.id === activeRoleId ? 700 : 500
                    }}
                  >
                    <span>{r.title}</span>
                    {r.id === activeRoleId && <IconCheck size={14} color="#0066ff" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div style={{ position: 'relative' }}>
            <button 
              style={styles.iconBtn} 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleDropdown(false);
              }} 
              title="Уведомления"
            >
              <IconBell size={18} color="#0a2540" />
              <span style={styles.bellDot}></span>
            </button>

            {showNotifications && (
              <div style={styles.notifDropdown} className="animate-fade-in">
                <div style={styles.notifHeader}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0a2540' }}>Уведомления системы</span>
                  <button onClick={() => setShowNotifications(false)} style={styles.closeBtn}>
                    <IconClose size={16} color="#64748b" />
                  </button>
                </div>
                <div style={styles.notifList}>
                  {notificationsList.map((n) => (
                    <div key={n.id} style={{ ...styles.notifItem, backgroundColor: n.isNew ? '#f0f9ff' : '#ffffff' }}>
                      <IconCheck size={16} color={n.isNew ? '#0066ff' : '#64748b'} />
                      <div>
                        <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: n.isNew ? 600 : 400 }}>{n.text}</div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{n.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar Profile Link */}
          <button 
            onClick={() => setActiveTab('profile')}
            style={styles.avatarBtn}
            title="Мой цифровой профиль"
          >
            <img src={currentRole.avatar} alt={currentRole.name} style={styles.avatarImg} />
          </button>
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
  roleSwitcherBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #cbd5e1',
    cursor: 'pointer'
  },
  roleDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '260px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 15px 35px rgba(10,37,64,0.25)',
    border: '1px solid #cbd5e1',
    padding: '6px',
    zIndex: 99999
  },
  roleDropdownItem: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.82rem',
    color: '#0f172a',
    cursor: 'pointer',
    textAlign: 'left'
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
    padding: 0
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
