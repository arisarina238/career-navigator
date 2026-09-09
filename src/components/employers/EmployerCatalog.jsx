import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { InternshipModal } from './InternshipModal';
import { 
  IconBriefcase, 
  IconShield, 
  IconMapPin,
  IconCheck,
  IconSparkles
} from '../common/Icons';

export const EmployerCatalog = ({ activeRole }) => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [appliedVacancyIds, setAppliedVacancyIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);

  const loadEmployers = () => {
    setLoading(true);
    api.getEmployers()
      .then((data) => {
        if (Array.isArray(data)) {
          setEmployers(data);
          const applied = new Set();
          data.forEach(emp => {
            if (emp.vacancies) {
              emp.vacancies.forEach(v => {
                if (v.isApplied) applied.add(v.id);
              });
            }
          });
          setAppliedVacancyIds(applied);
        }
      })
      .catch((err) => console.warn('Could not load employers from API:', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployers();
  }, []);

  const handleApply = (vacancy, companyName) => {
    setSelectedVacancy(vacancy);
    setSelectedCompany(companyName);
  };

  const handleVacancyApplied = (vacId) => {
    setAppliedVacancyIds((prev) => new Set([...prev, vacId]));
    setToastMessage(`Отклик на позицию «${selectedVacancy?.title || 'Вакансию'}» успешно отправлен работодателю!`);
    setTimeout(() => setToastMessage(null), 4500);
    // Также можно перезагрузить данные
    setTimeout(() => loadEmployers(), 1000);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <InternshipModal
        vacancy={selectedVacancy}
        companyName={selectedCompany}
        isOpen={!!selectedVacancy}
        onClose={() => {
          setSelectedVacancy(null);
          setSelectedCompany(null);
        }}
        onApplied={handleVacancyApplied}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
        }} className="animate-fade-in">
          <IconCheck size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={styles.bannerInner}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconBriefcase size={24} color="#0066ff" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0a2540' }}>
                Партнёры-Работодатели & Кадровый Резерв СПб
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Взаимодействие школьников, студентов и работодателей Санкт-Петербурга
            </p>
          </div>

          <span className="badge badge-success">
            <IconShield size={14} color="#10b981" /> Модерируемые работодатели
          </span>
        </div>
      </div>

      {loading && employers.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Загрузка списка работодателей и вакансий...
        </div>
      ) : (
        /* Employers List */
        <div style={styles.employersGrid}>
          {employers.map((emp) => (
            <div key={emp.id} className="card card-hoverable" style={styles.empCard}>
              <div style={styles.empHeader}>
                <img src={emp.logo} alt={emp.name} style={styles.logoImg} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={styles.companyName}>{emp.name}</h3>
                    <IconShield size={16} color="#0066ff" />
                  </div>
                  <span className="badge badge-navy" style={{ marginTop: '2px' }}>{emp.industry}</span>
                </div>
              </div>

              <p style={styles.companyDesc}>{emp.description}</p>

              <div style={styles.locationRow}>
                <IconMapPin size={15} color="#64748b" />
                <span>{emp.address}</span>
              </div>

              {/* Vacancies / Internships List */}
              <div style={styles.vacanciesBox}>
                <h4 style={styles.vacTitle}>Доступные позиции и стажировки:</h4>
                <div style={styles.vacList}>
                  {emp.vacancies && emp.vacancies.length > 0 ? (
                    emp.vacancies.map((v) => {
                      const isApplied = appliedVacancyIds.has(v.id);
                      return (
                        <div key={v.id} style={styles.vacItem}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{v.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#0066ff' }}>{v.salary} • {v.type}</div>
                          </div>
                          {isApplied ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              borderRadius: '8px'
                            }}>
                              <IconCheck size={13} color="#10b981" /> Отклик отправлен
                            </span>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                              onClick={() => handleApply(v, emp.name)}
                            >
                              Откликнуться
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      В настоящее время открытых позиций нет.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {},
  bannerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  employersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px'
  },
  empCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  empHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '14px'
  },
  logoImg: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '1px solid #cbd5e1'
  },
  companyName: {
    fontSize: '1.05rem',
    color: '#0a2540',
    margin: 0
  },
  companyDesc: {
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: 1.4,
    marginBottom: '12px'
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: '#64748b',
    marginBottom: '16px'
  },
  vacanciesBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    marginTop: 'auto'
  },
  vacTitle: {
    margin: '0 0 10px 0',
    fontSize: '0.85rem',
    color: '#0a2540'
  },
  vacList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  vacItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  }
};

export default EmployerCatalog;
