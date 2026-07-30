import React, { useState } from 'react';
import { AITU_ZONES } from '../../mock/data';
import { BookingModal } from './BookingModal';
import { 
  IconMapPin, 
  IconFlame, 
  IconCode, 
  IconCpu, 
  IconPalette, 
  IconHeart, 
  IconBriefcase, 
  IconCalendar, 
  IconStar, 
  IconCompass, 
  IconFilter 
} from '../common/Icons';

const ICON_MAP = {
  Code: IconCode,
  Cpu: IconCpu,
  Palette: IconPalette,
  HeartPulse: IconHeart,
  Briefcase: IconBriefcase
};

export const InteractiveAituMap = () => {
  const [selectedZoneId, setSelectedZoneId] = useState('it');
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [filterFormat, setFilterFormat] = useState('all');

  const selectedZone = AITU_ZONES.find((z) => z.id === selectedZoneId) || AITU_ZONES[0];

  const filteredTrials = selectedZone.trials.filter((t) => {
    if (filterFormat === 'all') return true;
    return t.format.toLowerCase().includes(filterFormat.toLowerCase());
  });

  return (
    <div style={styles.container} className="animate-fade-in">
      <BookingModal trial={selectedTrial} isOpen={!!selectedTrial} onClose={() => setSelectedTrial(null)} />

      {/* Map Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={styles.mapHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconMapPin size={22} color="#0066ff" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0a2540' }}>
                Интерактивная карта профориентационных зон АИТУ
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Академия Траекторий Успеха Санкт-Петербурга • Кластерная визуализация (Mazapark Ref)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="badge badge-gold">
              <IconFlame size={14} color="#ff9f1c" /> Горячие зоны подсвечены ИИ
            </span>
          </div>
        </div>
      </div>

      {/* Visual Zone Selector Grid */}
      <div style={styles.zonesGrid}>
        {AITU_ZONES.map((zone) => {
          const IconComp = ICON_MAP[zone.icon] || IconMapPin;
          const isSelected = selectedZoneId === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedZoneId(zone.id)}
              style={{
                ...styles.zoneCard,
                ...(isSelected ? styles.selectedZoneCard : {}),
                borderColor: isSelected ? zone.color : '#e2e8f0'
              }}
            >
              {zone.hotZone && (
                <div style={styles.hotBadge}>
                  <IconFlame size={12} color="#ffffff" />
                  <span>Рекомендация ИИ (94%)</span>
                </div>
              )}

              <div style={{ ...styles.iconCircle, backgroundColor: zone.color }}>
                <IconComp size={22} color="#ffffff" />
              </div>

              <h4 style={styles.zoneName}>{zone.name}</h4>
              <p style={styles.zoneDesc}>{zone.description}</p>

              <div style={styles.zoneFooter}>
                <span className="badge badge-navy">{zone.trialsCount} проб доступно</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Zone Pro-Trials Catalog */}
      <div style={{ marginTop: '28px' }}>
        <div style={styles.trialsHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0a2540' }}>
              Доступные профпробы в зоне: «{selectedZone.name}»
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Выберите удобную дату и забронируйте место в системе
            </p>
          </div>

          {/* Filters */}
          <div style={styles.filterRow}>
            <IconFilter size={16} color="#64748b" />
            <button
              onClick={() => setFilterFormat('all')}
              className={`btn ${filterFormat === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={styles.filterBtn}
            >
              Все форматы
            </button>
            <button
              onClick={() => setFilterFormat('очная')}
              className={`btn ${filterFormat === 'очная' ? 'btn-primary' : 'btn-secondary'}`}
              style={styles.filterBtn}
            >
              Очные
            </button>
            <button
              onClick={() => setFilterFormat('мастер-класс')}
              className={`btn ${filterFormat === 'мастер-класс' ? 'btn-primary' : 'btn-secondary'}`}
              style={styles.filterBtn}
            >
              Мастер-классы
            </button>
          </div>
        </div>

        {/* Pro-trial Cards */}
        <div style={styles.trialsGrid}>
          {filteredTrials.map((trial) => (
            <div key={trial.id} className="card card-hoverable" style={styles.trialCard}>
              <div style={styles.trialMetaTop}>
                <span className="badge badge-primary">{trial.format}</span>
                <span style={styles.ratingBadge}>
                  <IconStar size={13} color="#ff9f1c" />
                  {trial.rating} ({trial.reviewsCount} отзывов)
                </span>
              </div>

              <h4 style={styles.trialTitle}>{trial.title}</h4>
              <p style={styles.trialDesc}>{trial.description}</p>

              <div style={styles.detailsList}>
                <div style={styles.detailItem}>
                  <IconCalendar size={14} color="#0066ff" />
                  <span>{trial.nextDate} • {trial.duration}</span>
                </div>
                <div style={styles.detailItem}>
                  <IconCompass size={14} color="#0066ff" />
                  <span>{trial.metro}</span>
                </div>
                <div style={styles.detailItem}>
                  <IconMapPin size={14} color="#64748b" />
                  <span>{trial.address}</span>
                </div>
              </div>

              <div style={styles.tagsRow}>
                {trial.tags.map((tag, idx) => (
                  <span key={idx} style={styles.tagItem}>#{tag}</span>
                ))}
              </div>

              <div style={styles.trialActionRow}>
                <div style={styles.slotsCount}>
                  Свободно: <strong>{trial.availableSlots}</strong> из {trial.maxSlots} мест
                </div>
                <button className="btn btn-primary" onClick={() => setSelectedTrial(trial)}>
                  Записаться
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {},
  mapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  zonesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px'
  },
  zoneCard: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.25s ease'
  },
  selectedZoneCard: {
    boxShadow: '0 8px 20px rgba(0, 102, 255, 0.15)',
    transform: 'translateY(-2px)'
  },
  hotBadge: {
    position: 'absolute',
    top: '-10px',
    right: '12px',
    backgroundColor: '#ff9f1c',
    color: '#ffffff',
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  iconCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  zoneName: {
    fontSize: '1rem',
    color: '#0a2540',
    marginBottom: '4px'
  },
  zoneDesc: {
    fontSize: '0.78rem',
    color: '#64748b',
    lineHeight: 1.35,
    marginBottom: '14px',
    flex: 1
  },
  zoneFooter: {
    display: 'flex',
    alignItems: 'center'
  },
  trialsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem'
  },
  trialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px'
  },
  trialCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  trialMetaTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155'
  },
  trialTitle: {
    fontSize: '1.1rem',
    color: '#0a2540',
    marginBottom: '8px'
  },
  trialDesc: {
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: 1.4,
    marginBottom: '14px'
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '8px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: '#334155'
  },
  tagsRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '16px'
  },
  tagItem: {
    fontSize: '0.72rem',
    color: '#0066ff',
    fontWeight: 600
  },
  trialActionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0'
  },
  slotsCount: {
    fontSize: '0.8rem',
    color: '#64748b'
  }
};
