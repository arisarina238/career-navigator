import React from 'react';
import { ShieldCheck, ExternalLink, MapPin, Phone, Mail } from 'lucide-react';
import { IconCompass } from '../common/Icons';

export const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.grid}>
          <div>
            <div style={styles.brandRow}>
              <IconCompass size={22} color="#38bdf8" />
              <h3 style={styles.brandTitle}>КАРЬЕРНЫЙ НАВИГАТОР СПб</h3>
            </div>
            <p style={styles.brandDesc}>
              Модуль профориентации и построения карьерных маршрутов Санкт-Петербурга. 
              Интегрировано с порталом «Работа в России» и АИТУ.
            </p>
            <div style={styles.gosuBadge}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Защита данных ФЗ-152 • ЕСИА Госуслуги</span>
            </div>
          </div>

          <div>
            <h4 style={styles.footerHeading}>Разделы Портала</h4>
            <ul style={styles.linkList}>
              <li><a href="#profile">Цифровой профиль</a></li>
              <li><a href="#diagnostics">ИИ-Диагностика интересов</a></li>
              <li><a href="#map">Карта зон АИТУ</a></li>
              <li><a href="#roadmap">Персональный маршрут</a></li>
              <li><a href="#employers">Партнеры-Работодатели</a></li>
            </ul>
          </div>

          <div>
            <h4 style={styles.footerHeading}>Контакты & Поддержка</h4>
            <div style={styles.contactItem}>
              <MapPin size={15} color="#38bdf8" />
              <span>Санкт-Петербург, ул. Профсоюзная, д. 14 (АИТУ)</span>
            </div>
            <div style={styles.contactItem}>
              <Phone size={15} color="#38bdf8" />
              <span>Горячая линия: 8 (812) 320-00-00</span>
            </div>
            <div style={styles.contactItem}>
              <Mail size={15} color="#38bdf8" />
              <span>pkp.support@r21.spb.ru</span>
            </div>
          </div>
        </div>

        <div style={styles.bottomBar}>
          <span>© 2026 Санкт-Петербургский Карьерный Навигатор (pkp.r21.spb.ru)</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="https://r21.spb.ru" target="_blank" rel="noreferrer">Служба занятости r21.spb.ru</a>
            <a href="https://trudvsem.ru" target="_blank" rel="noreferrer">Работа в России</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#071540',
    color: '#94a3b8',
    borderTop: '1px solid #1e293b',
    padding: '40px 0 20px 0',
    fontSize: '0.85rem'
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
    marginBottom: '32px'
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  logoIcon: {
    fontSize: '1.5rem'
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: '1.1rem',
    margin: 0
  },
  brandDesc: {
    lineHeight: 1.45,
    marginBottom: '14px',
    color: '#cbd5e1'
  },
  gosuBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#6ee7b7',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.78rem'
  },
  footerHeading: {
    color: '#ffffff',
    fontSize: '0.95rem',
    marginBottom: '14px'
  },
  linkList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    color: '#cbd5e1'
  },
  bottomBar: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    color: '#64748b',
    fontSize: '0.8rem'
  }
};
