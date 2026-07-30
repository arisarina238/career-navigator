import React from 'react';
import { 
  IconUser, 
  IconBrain, 
  IconMapPin, 
  IconBot, 
  IconRoadmap, 
  IconBriefcase 
} from '../common/Icons';

export const Navigation = ({ activeTabId, onSelectTab, activeRole }) => {
  // Role-customized navigation tabs
  const getTabsForRole = () => {
    if (activeRole?.id === 'mentor') {
      return [
        { id: 'profile', label: '1. Кабинет Наставника', icon: IconUser },
        { id: 'roadmap', label: '2. Группа 9 "Б" (28 учен.)', icon: IconRoadmap },
        { id: 'map', label: '3. Назначение профпроб', icon: IconMapPin },
        { id: 'assistant', label: '4. Аналитика группы', icon: IconBot },
        { id: 'diagnostics', label: '5. Диагностика учеников', icon: IconBrain }
      ];
    }

    if (activeRole?.id === 'parent') {
      return [
        { id: 'profile', label: '1. Кабинет Родителя', icon: IconUser },
        { id: 'diagnostics', label: '2. Результаты тестов ребенка', icon: IconBrain },
        { id: 'map', label: '3. Согласование записей (1 треб.)', icon: IconMapPin },
        { id: 'roadmap', label: '4. Календарь выездов', icon: IconRoadmap }
      ];
    }

    if (activeRole?.id === 'employer') {
      return [
        { id: 'profile', label: '1. Кабинет Компании', icon: IconUser },
        { id: 'employers', label: '2. Отклики & Кандидаты (14)', icon: IconBriefcase },
        { id: 'map', label: '3. Профпробы компании', icon: IconMapPin },
        { id: 'assistant', label: '4. Аналитика предложений', icon: IconBot }
      ];
    }

    // Default: Student
    return [
      { id: 'profile', label: '1. Цифровой профиль', icon: IconUser },
      { id: 'diagnostics', label: '2. ИИ-Диагностика', icon: IconBrain },
      { id: 'map', label: '3. Карта зон АИТУ', icon: IconMapPin },
      { id: 'assistant', label: '4. ИИ-Ассистент & Аналитика', icon: IconBot },
      { id: 'roadmap', label: '5. Образовательный маршрут', icon: IconRoadmap },
      { id: 'employers', label: '6. Работодатели & Стажировки', icon: IconBriefcase }
    ];
  };

  const navTabs = getTabsForRole();

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navInner}>
        {navTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.activeTabBtn : {})
              }}
            >
              <IconComponent size={17} color={isActive ? '#0066ff' : '#64748b'} />
              <span>{tab.label}</span>
              {isActive && <div style={styles.activeBorder} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const styles = {
  navContainer: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'hidden',
    width: '100%'
  },
  navInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2px'
  },
  tabBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#64748b',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    whiteSpace: 'nowrap'
  },
  activeTabBtn: {
    color: '#0a2540'
  },
  activeBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    backgroundColor: '#0066ff',
    borderRadius: '3px 3px 0 0'
  }
};
