import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { 
  IconCompass, 
  IconSearch, 
  IconBell, 
  IconShield, 
  IconClose, 
  IconCheck,
  IconSparkles,
  IconTrash,
  IconCalendar,
  IconBriefcase,
  IconBrain,
  IconArrowRight,
  IconMapPin
} from '../common/Icons';

/**
 * Отдельное модальное окно уведомлений
 */
const NotificationsModal = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onDeleteReadNotifications
}) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  if (!isOpen) return null;

  const filtered = filter === 'unread' 
    ? notifications.filter((n) => !n.isRead) 
    : notifications;

  const readCount = notifications.filter((n) => n.isRead).length;

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={onClose}>
      <div 
        className="modal-content animate-fade-in" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '620px', width: '100%', borderRadius: '20px', padding: 0, overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={styles.notifModalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.notifModalIconBox}>
              <IconBell size={20} color="#0066ff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0a2540' }}>Уведомления</h3>
                {unreadCount > 0 && (
                  <span style={styles.unreadBadge}>
                    {unreadCount} новых
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Центр оповещений и статусов цифрового профиля
              </p>
            </div>
          </div>

          <button onClick={onClose} style={styles.modalCloseBtn} title="Закрыть">
            <IconClose size={16} color="#475569" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div style={styles.notifToolbar}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                ...styles.filterTabBtn,
                backgroundColor: filter === 'all' ? '#0066ff' : '#f1f5f9',
                color: filter === 'all' ? '#ffffff' : '#475569',
                fontWeight: filter === 'all' ? 700 : 500
              }}
            >
              Все ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                ...styles.filterTabBtn,
                backgroundColor: filter === 'unread' ? '#0066ff' : '#f1f5f9',
                color: filter === 'unread' ? '#ffffff' : '#475569',
                fontWeight: filter === 'unread' ? 700 : 500
              }}
            >
              Непрочитанные ({unreadCount})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button onClick={onMarkAllRead} style={styles.markAllReadBtn}>
                <IconCheck size={14} color="#0066ff" />
                <span>Прочитать все</span>
              </button>
            )}
            {readCount > 0 && (
              <button 
                onClick={onDeleteReadNotifications} 
                style={styles.deleteReadBtn}
                title="Удалить прочитанные уведомления"
              >
                <IconTrash size={14} color="#ef4444" />
                <span>Удалить прочитанные</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List Body */}
        <div style={{ maxHeight: '460px', overflowY: 'auto', padding: '14px 20px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
              <IconBell size={42} color="#cbd5e1" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>
                {filter === 'unread' ? 'Нет непрочитанных уведомлений' : 'У вас пока нет уведомлений'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                Здесь отображаются статусы откликов на вакансии, записи на профпробы и приглашения.
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <div 
                key={n.id} 
                style={{
                  ...styles.notifCard,
                  backgroundColor: !n.isRead ? '#f0f9ff' : '#ffffff',
                  borderColor: !n.isRead ? '#bae6fd' : '#e2e8f0'
                }}
              >
                <div style={{
                  ...styles.notifDot,
                  backgroundColor: !n.isRead ? '#0066ff' : '#cbd5e1'
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h5 style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      fontWeight: !n.isRead ? 700 : 600
                    }}>
                      {n.title}
                    </h5>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {new Date(n.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.82rem',
                    color: '#475569',
                    lineHeight: 1.45
                  }}>
                    {n.message}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                  {!n.isRead && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      title="Отметить прочитанным"
                      style={styles.notifActionBtn}
                    >
                      <IconCheck size={16} color="#0066ff" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNotification(n.id)}
                    title="Удалить уведомление"
                    style={styles.notifActionBtn}
                  >
                    <IconTrash size={15} color="#94a3b8" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const Header = ({ 
  currentRole, 
  activeTab, 
  setActiveTab, 
  onStartTour, 
  currentUser,
  onLogout
}) => {
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Этап авторизации / регистрации - поиск и уведомления должны быть скрыты
  const isAuthStage = !currentUser || activeTab === 'login' || activeTab === 'register';

  // Search catalog index
  const [searchData, setSearchData] = useState({ trials: [], vacancies: [] });
  const searchContainerRef = useRef(null);

  const fetchNotifications = () => {
    if (!currentUser || isAuthStage) return;
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
    if (isAuthStage) return;
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [currentUser, isAuthStage]);

  // Загружаем данные для сквозного поиска
  useEffect(() => {
    Promise.all([
      api.getAituZones().catch(() => []),
      api.getEmployers().catch(() => [])
    ]).then(([zones, employers]) => {
      const trials = [];
      if (Array.isArray(zones)) {
        zones.forEach((z) => {
          if (z.trials) {
            z.trials.forEach((t) => {
              trials.push({
                id: t.id,
                title: t.title,
                format: t.format,
                address: t.address,
                metro: t.metro,
                tags: t.tags || [],
                zoneName: z.name,
                zoneColor: z.color
              });
            });
          }
        });
      }

      const vacancies = [];
      if (Array.isArray(employers)) {
        employers.forEach((emp) => {
          if (emp.vacancies) {
            emp.vacancies.forEach((v) => {
              vacancies.push({
                id: v.id,
                title: v.title,
                salary: v.salary,
                type: v.type,
                companyName: emp.name,
                industry: emp.industry,
                address: emp.address
              });
            });
          }
        });
      }

      setSearchData({ trials, vacancies });
    });
  }, []);

  // Закрытие поиска по клику вне контейнера
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotificationsList((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Could not mark read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Could not mark all read:', err.message);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.deleteNotification(id);
      const target = notificationsList.find((n) => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.warn('Could not delete notification:', err.message);
    }
  };

  const handleDeleteReadNotifications = async () => {
    try {
      await api.deleteReadNotifications();
      setNotificationsList((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.warn('Could not delete read notifications:', err.message);
    }
  };

  // Поисковая фильтрация
  const query = searchQuery.trim().toLowerCase();

  const matchingTrials = query.length > 0
    ? searchData.trials.filter((t) =>
        t.title.toLowerCase().includes(query) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query))) ||
        (t.metro && t.metro.toLowerCase().includes(query)) ||
        (t.zoneName && t.zoneName.toLowerCase().includes(query))
      ).slice(0, 4)
    : [];

  const matchingVacancies = query.length > 0
    ? searchData.vacancies.filter((v) =>
        v.title.toLowerCase().includes(query) ||
        (v.companyName && v.companyName.toLowerCase().includes(query)) ||
        (v.industry && v.industry.toLowerCase().includes(query)) ||
        (v.type && v.type.toLowerCase().includes(query))
      ).slice(0, 4)
    : [];

  const platformSections = [
    { title: 'Интерактивная карта зон АИТУ', tab: 'map', desc: 'Запись на профессиональные пробы', icon: IconCompass },
    { title: 'ИИ-Диагностика интересов', tab: 'diagnostics', desc: 'Комплексный профориентационный тест', icon: IconBrain },
    { title: 'Цифровой профиль ученика', tab: 'profile', desc: 'Портфолио, СНИЛС и верификация ЕСИА', icon: IconShield },
    { title: 'Карьерный маршрут СПб', tab: 'roadmap', desc: 'Персональная траектория развития', icon: IconCalendar },
    { title: 'Партнёры-Работодатели и Вакансии', tab: 'employers', desc: 'Каталог стажировок и вакансий', icon: IconBriefcase }
  ];

  const matchingSections = query.length > 0
    ? platformSections.filter((s) =>
        s.title.toLowerCase().includes(query) ||
        s.desc.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const totalResults = matchingTrials.length + matchingVacancies.length + matchingSections.length;
  const showSearchDropdown = isSearchFocused && query.length > 0;

  const handleSelectSearchResult = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    setIsSearchFocused(false);
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
      {/* Notifications Modal (только для авторизованных) */}
      {!isAuthStage && (
        <NotificationsModal
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
          notifications={notificationsList}
          unreadCount={unreadCount}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onDeleteNotification={handleDeleteNotification}
          onDeleteReadNotifications={handleDeleteReadNotifications}
        />
      )}

      {/* Top Gov Strip */}
      <div style={styles.topGovBar}>
        <div style={styles.topGovBarInner}>
          <div style={styles.govBrand}>
            <span style={styles.coatBadge}>СПб</span>
            <span>Служба занятости r21.spb.ru • Портал «Работа в России»</span>
          </div>

          <div style={styles.topGovRight}>
            {!isAuthStage ? (
              <>
                <div style={styles.statusGosuTag}>
                  <IconShield size={13} color="#6ee7b7" />
                  <span>{currentUser?.gosuslugiVerified ? 'ЕСИА Госуслуги (Подтверждено)' : 'ЕСИА Госуслуги'}</span>
                </div>
                <button onClick={onStartTour} style={styles.tourPillBtn}>
                  <IconSparkles size={13} color="#0066ff" /> Интерактивный тур
                </button>
              </>
            ) : (
              <div style={styles.statusGosuTag}>
                <IconShield size={13} color="#94a3b8" />
                <span>Официальный портал СПб</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div style={styles.mainHeaderRow}>
        {/* Brand */}
        <button 
          onClick={() => setActiveTab(currentUser ? 'profile' : 'login')} 
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

        {/* Global Interactive Search (скрыт на этапе входа) */}
        {!isAuthStage && (
          <div style={styles.searchContainer} ref={searchContainerRef}>
            <div style={styles.searchBox}>
              <IconSearch size={16} color="#64748b" />
              <input 
                type="text" 
                placeholder="Поиск профпроб, вакансий, ВУЗов СПб..." 
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsSearchFocused(false);
              }}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                style={styles.searchClearBtn}
                title="Очистить поиск"
              >
                <IconClose size={14} color="#64748b" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div style={styles.searchResultsDropdown} className="animate-fade-in">
              {totalResults === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  Ничего не найдено по запросу «<strong>{searchQuery}</strong>»
                </div>
              ) : (
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {/* Matching Sections */}
                  {matchingSections.length > 0 && (
                    <div style={styles.searchCategoryBlock}>
                      <div style={styles.searchCategoryTitle}>Разделы платформы</div>
                      {matchingSections.map((sec, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSearchResult(sec.tab)}
                          style={styles.searchResultItem}
                        >
                          <div style={{ ...styles.searchItemIcon, backgroundColor: '#eff6ff', color: '#0066ff' }}>
                            <sec.icon size={16} color="#0066ff" />
                          </div>
                          <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={styles.searchItemTitle}>{sec.title}</div>
                            <div style={styles.searchItemDesc}>{sec.desc}</div>
                          </div>
                          <IconArrowRight size={14} color="#94a3b8" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Pro-Trials */}
                  {matchingTrials.length > 0 && (
                    <div style={styles.searchCategoryBlock}>
                      <div style={styles.searchCategoryTitle}>Профессиональные пробы ({matchingTrials.length})</div>
                      {matchingTrials.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleSelectSearchResult('map')}
                          style={styles.searchResultItem}
                        >
                          <div style={{ ...styles.searchItemIcon, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                            <IconMapPin size={16} color="#16a34a" />
                          </div>
                          <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={styles.searchItemTitle}>{t.title}</div>
                            <div style={styles.searchItemDesc}>{t.zoneName} • {t.format} • {t.metro}</div>
                          </div>
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>На карту</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Vacancies & Employers */}
                  {matchingVacancies.length > 0 && (
                    <div style={styles.searchCategoryBlock}>
                      <div style={styles.searchCategoryTitle}>Вакансии & Работодатели ({matchingVacancies.length})</div>
                      {matchingVacancies.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleSelectSearchResult('employers')}
                          style={styles.searchResultItem}
                        >
                          <div style={{ ...styles.searchItemIcon, backgroundColor: '#faf5ff', color: '#9333ea' }}>
                            <IconBriefcase size={16} color="#9333ea" />
                          </div>
                          <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={styles.searchItemTitle}>{v.title}</div>
                            <div style={styles.searchItemDesc}>{v.companyName} • {v.salary} • {v.type}</div>
                          </div>
                          <span className="badge badge-navy" style={{ fontSize: '0.7rem' }}>В каталог</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

        {/* Actions & User State */}
        <div style={styles.headerRight}>
          {/* Notifications Trigger Button (скрыт на этапе входа) */}
          {!isAuthStage && (
            <button 
              style={styles.iconBtn} 
              onClick={() => setShowNotificationsModal(true)} 
              title="Открыть уведомления"
            >
              <IconBell size={18} color="#0a2540" />
              {unreadCount > 0 && (
                <span style={styles.bellBadge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

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
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.65rem',
    padding: '1px 5px',
    borderRadius: '4px',
    letterSpacing: '0.5px'
  },
  topGovRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusGosuTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#6ee7b7',
    fontSize: '0.74rem'
  },
  tourPillBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#ffffff',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '0.72rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  mainHeaderRow: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px'
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
    backgroundColor: '#0066ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
  },
  siteTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#0a2540',
    letterSpacing: '-0.3px',
    lineHeight: 1.1
  },
  siteSubtitle: {
    margin: '2px 0 0 0',
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: 600
  },
  searchContainer: {
    flex: 1,
    maxWidth: '480px',
    position: 'relative'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: '24px',
    padding: '8px 16px',
    gap: '10px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
    color: '#0f172a'
  },
  searchClearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  searchResultsDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 18px 40px rgba(10,37,64,0.18)',
    border: '1px solid #cbd5e1',
    zIndex: 9999,
    overflow: 'hidden'
  },
  searchCategoryBlock: {
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  searchCategoryTitle: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 16px 6px 16px'
  },
  searchResultItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    textAlign: 'left'
  },
  searchItemIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  searchItemTitle: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: '#0f172a'
  },
  searchItemDesc: {
    fontSize: '0.74rem',
    color: '#64748b',
    marginTop: '2px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  iconBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease'
  },
  bellBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#0066ff',
    color: '#ffffff',
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '10px',
    border: '2px solid #ffffff'
  },
  userProfileGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userRoleBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '12px'
  },
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  userNameHeader: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#0a2540'
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

  // Modal styles
  notifModalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  },
  notifModalIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadBadge: {
    backgroundColor: '#0066ff',
    color: '#ffffff',
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0'
  },
  notifToolbar: {
    padding: '12px 20px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    backgroundColor: '#ffffff'
  },
  filterTabBtn: {
    padding: '5px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s ease'
  },
  markAllReadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#0066ff',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 6px'
  },
  deleteReadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 6px'
  },
  notifCard: {
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    transition: 'all 0.2s ease'
  },
  notifDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0
  },
  notifActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
