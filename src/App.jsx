import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';

// Auth Components
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';

// Student Blocks
import { DigitalProfileCard } from './components/profile/DigitalProfileCard';
import { RoleDashboards } from './components/profile/RoleDashboards';
import { DiagnosticQuiz } from './components/diagnostics/DiagnosticQuiz';
import { InteractiveAituMap } from './components/map/InteractiveAituMap';
import { AiChatWindow, AiAssistantWidget } from './components/ai-assistant/AiChatWindow';
import { CareerRoadmap } from './components/roadmap/CareerRoadmap';
import { EmployerCatalog } from './components/employers/EmployerCatalog';

// Role-Dedicated Views
import { MentorView } from './components/roles/MentorView';
import { ParentView } from './components/roles/ParentView';
import { EmployerView } from './components/roles/EmployerView';

const GUEST_ROLE = {
  id: 'student',
  title: 'Участник (Школьник)',
  name: 'Ученик СПб',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  gosuslugiVerified: false
};

export function App() {
  const [currentUser, setCurrentUser] = useState(() => api.getCurrentUser());
  const [activeRole, setActiveRole] = useState(GUEST_ROLE);
  const [activeTab, setActiveTab] = useState('profile');

  // Helper to map DB user role to frontend role view
  const syncRoleWithUser = useCallback((user) => {
    if (!user || !user.role) {
      setActiveRole(GUEST_ROLE);
      return;
    }
    const roleUpper = user.role.toUpperCase();

    if (roleUpper === 'STUDENT') {
      setActiveRole({
        id: 'student',
        title: 'Участник (Школьник)',
        name: user.fullName || 'Школьник',
        avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        grade: user.studentProfile?.grade || '9 класс',
        school: user.studentProfile?.school || 'ГБОУ СОШ Санкт-Петербурга',
        progressPercent: user.studentProfile?.progressPercent ?? 0,
        gosuslugiVerified: Boolean(user.gosuslugiVerified),
        email: user.email
      });
    } else if (roleUpper === 'MENTOR') {
      setActiveRole({
        id: 'mentor',
        title: 'Наставник (Педагог / Куратор)',
        name: user.fullName || 'Наставник',
        avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        organization: user.mentorProfile?.organization || 'МЦК АИТУ / ГБОУ СОШ СПб',
        position: user.mentorProfile?.position || 'Куратор карьерных траекторий',
        gosuslugiVerified: Boolean(user.gosuslugiVerified),
        email: user.email
      });
    } else if (roleUpper === 'PARENT') {
      setActiveRole({
        id: 'parent',
        title: 'Родитель',
        name: user.fullName || 'Родитель',
        avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        gosuslugiVerified: Boolean(user.gosuslugiVerified),
        email: user.email
      });
    } else if (roleUpper === 'EMPLOYER') {
      setActiveRole({
        id: 'employer',
        title: 'Работодатель / Партнер',
        name: user.fullName || 'Работодатель',
        avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        companyName: user.employerProfile?.companyName || 'Организация-партнер СПб',
        industry: user.employerProfile?.industry || 'IT & Инженерия',
        gosuslugiVerified: Boolean(user.gosuslugiVerified),
        email: user.email
      });
    }
  }, []);

  const refreshCurrentUser = useCallback(() => {
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then((res) => {
          if (res && res.user) {
            setCurrentUser(res.user);
            api.setSession(token, res.user);
            syncRoleWithUser(res.user);
          }
        })
        .catch(() => {
          api.logout();
          setCurrentUser(null);
          setActiveRole(GUEST_ROLE);
        });
    } else {
      const stored = api.getCurrentUser();
      if (stored) {
        syncRoleWithUser(stored);
      }
    }
  }, [syncRoleWithUser]);

  // Restore and verify user session on load
  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  const handleNavigateTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTour = () => {
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    syncRoleWithUser(userData);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveRole(GUEST_ROLE);
    setActiveTab('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* 1. Sleek Modern Header */}
      <Header 
        currentRole={activeRole} 
        activeTab={activeTab} 
        setActiveTab={handleNavigateTab} 
        onStartTour={handleStartTour}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Role-Customized Segmented Navigation (visible outside auth pages) */}
      {activeTab !== 'login' && activeTab !== 'register' && (
        <Navigation activeTabId={activeTab} onSelectTab={handleNavigateTab} activeRole={activeRole} />
      )}

      {/* 3. Main Content Area */}
      <main className="main-content">
        {/* Auth Pages */}
        {activeTab === 'login' && (
          <div className="animate-fade-in">
            <Login 
              onLogin={handleAuthSuccess} 
              onGoToRegister={() => setActiveTab('register')} 
            />
          </div>
        )}

        {activeTab === 'register' && (
          <div className="animate-fade-in">
            <Register 
              onRegister={handleAuthSuccess} 
              onGoToLogin={() => setActiveTab('login')} 
            />
          </div>
        )}

        {/* Dynamic Content based on Selected Role (when not on auth page) */}
        {activeTab !== 'login' && activeTab !== 'register' && (
          <>
            {activeRole.id === 'mentor' && (
              <MentorView activeTab={activeTab} onNavigateTab={handleNavigateTab} />
            )}

            {activeRole.id === 'parent' && (
              <ParentView activeTab={activeTab} />
            )}

            {activeRole.id === 'employer' && (
              <EmployerView activeTab={activeTab} />
            )}

            {/* Student Role Content */}
            {activeRole.id === 'student' && (
              <>
                {activeTab === 'profile' && (
                  <div className="animate-fade-in">
                    <DigitalProfileCard currentRole={activeRole} />
                    <RoleDashboards activeRole={activeRole} onNavigateTab={handleNavigateTab} />
                  </div>
                )}

                {activeTab === 'diagnostics' && (
                  <DiagnosticQuiz onNavigateTab={handleNavigateTab} />
                )}

                {activeTab === 'map' && (
                  <InteractiveAituMap />
                )}

                {activeTab === 'assistant' && (
                  <AiChatWindow />
                )}

                {activeTab === 'roadmap' && (
                  <CareerRoadmap activeRole={activeRole} />
                )}

                {activeTab === 'employers' && (
                  <EmployerCatalog activeRole={activeRole} />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 4. Floating AI Assistant (outside auth pages) */}
      {activeTab !== 'login' && activeTab !== 'register' && (
        <AiAssistantWidget />
      )}

      {/* 5. Modern Footer */}
      <Footer />
    </div>
  );
}

export default App;
