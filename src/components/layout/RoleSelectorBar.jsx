import React from 'react';
import { USER_ROLES } from '../../mock/data';
import { Users, GraduationCap, UserCheck, ShieldAlert, Building2 } from 'lucide-react';

export const RoleSelectorBar = ({ activeRoleId, onSelectRole }) => {
  const rolesList = [
    { ...USER_ROLES.STUDENT, icon: GraduationCap, color: '#0284c7' },
    { ...USER_ROLES.MENTOR, icon: UserCheck, color: '#10b981' },
    { ...USER_ROLES.PARENT, icon: Users, color: '#f59e0b' },
    { ...USER_ROLES.EMPLOYER, icon: Building2, color: '#8b5cf6' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.titleGroup}>
          <ShieldAlert size={18} color="#0b2265" />
          <span style={styles.roleTitle}>Переключение роли интерфейса (Демо-режим СПб):</span>
        </div>
        <div style={styles.roleButtons}>
          {rolesList.map((role) => {
            const Icon = role.icon;
            const isSelected = activeRoleId === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role)}
                style={{
                  ...styles.roleBtn,
                  ...(isSelected ? { ...styles.activeRoleBtn, borderColor: role.color } : {})
                }}
              >
                <Icon size={16} color={isSelected ? role.color : '#64748b'} />
                <span>{role.title}</span>
                {isSelected && <span style={{ ...styles.activeDot, backgroundColor: role.color }}></span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#edf2f7',
    borderBottom: '1px solid #cbd5e1',
    padding: '8px 0'
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  roleTitle: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#0b2265'
  },
  roleButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  roleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#334155',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  activeRoleBtn: {
    fontWeight: 700,
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
    transform: 'translateY(-1px)'
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginLeft: '2px'
  }
};
