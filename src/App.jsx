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

export function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [roadmapKey, setRoadmapKey] = useState(0);

  // Синхронизация роли с объектом пользователя из БД
  const syncRoleWithUser = useCallback((user) => {
    if (!user || !user.role) {
      setActiveRole(null);
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

  // Проверка сессии и токена при старте клиента
  const refreshCurrentUser = useCallback(() => {
    const token = api.getToken();
    if (!token) {
      setCurrentUser(null);
      setActiveRole(null);
      setActiveTab('login');
      setIsAuthChecking(false);
      return;
    }

    api.getMe()
      .then((res) => {
        if (res && res.user) {
          setCurrentUser(res.user);
          api.setSession(token, res.user);
          syncRoleWithUser(res.user);
          setActiveTab('profile');
        } else {
          api.logout();
          setCurrentUser(null);
          setActiveRole(null);
          setActiveTab('login');
        }
      })
      .catch(() => {
        api.logout();
        setCurrentUser(null);
        setActiveRole(null);
        setActiveTab('login');
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, [syncRoleWithUser]);

  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  const handleNavigateTab = (tabId) => {
    if (!currentUser && tabId !== 'login' && tabId !== 'register') {
      setActiveTab('login');
      return;
    }
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTour = () => {
    if (!currentUser) {
      setActiveTab('login');
      return;
    }
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
    setActiveRole(null);
    setActiveTab('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Экран проверки авторизации
  if (isAuthChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '4px solid #e2e8f0',
          borderTopColor: '#0066ff',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
          Проверка авторизации...
        </span>
      </div>
    );
  }

  // Если пользователь не авторизован — рендерим только страницу входа/регистрации
  if (!currentUser) {
    return (
      <div className="app-container">
        <Header 
          currentRole={null} 
          activeTab={activeTab} 
          setActiveTab={handleNavigateTab} 
          onStartTour={handleStartTour}
          currentUser={null}
          onLogout={handleLogout}
        />

        <main className="main-content" style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
          {activeTab === 'register' ? (
            <div className="animate-fade-in">
              <Register 
                onRegister={handleAuthSuccess} 
                onGoToLogin={() => setActiveTab('login')} 
              />
            </div>
          ) : (
            <div className="animate-fade-in">
              <Login 
                onLogin={handleAuthSuccess} 
                onGoToRegister={() => setActiveTab('register')} 
              />
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  }

  // Авторизованный режим
  return (
    <div className="app-container">
      {/* 1. Header */}
      <Header 
        currentRole={activeRole} 
        activeTab={activeTab} 
        setActiveTab={handleNavigateTab} 
        onStartTour={handleStartTour}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Navigation */}
      {activeRole && (
        <Navigation activeTabId={activeTab} onSelectTab={handleNavigateTab} activeRole={activeRole} />
      )}

      {/* 3. Main Content */}
      <main className="main-content">
        {activeRole && (
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
                    <DigitalProfileCard currentRole={activeRole} onNavigateTab={handleNavigateTab} />
                    <RoleDashboards activeRole={activeRole} onNavigateTab={handleNavigateTab} />
                  </div>
                )}

                {activeTab === 'diagnostics' && (
                  <DiagnosticQuiz
                    onNavigateTab={handleNavigateTab}
                    onComplete={() => setRoadmapKey((k) => k + 1)}
                  />
                )}

                {activeTab === 'map' && (
                  <InteractiveAituMap />
                )}

                {activeTab === 'assistant' && (
                  <AiChatWindow scenario={currentUser?.studentProfile?.currentScenario || 'A'} />
                )}

                {activeTab === 'roadmap' && (
                  <CareerRoadmap key={roadmapKey} activeRole={activeRole} />
                )}

                {activeTab === 'employers' && (
                  <EmployerCatalog activeRole={activeRole} />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 4. Floating AI Assistant (только для авторизованных) */}
      <AiAssistantWidget />

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}

export default App;
