import React, { useState } from 'react';
import { USER_ROLES } from './mock/data';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';

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
  const [activeRole, setActiveRole] = useState(USER_ROLES.STUDENT);
  const [activeTab, setActiveTab] = useState('profile');

  const rolesList = [
    USER_ROLES.STUDENT,
    USER_ROLES.MENTOR,
    USER_ROLES.PARENT,
    USER_ROLES.EMPLOYER
  ];

  const handleSelectRole = (role) => {
    setActiveRole(role);
    setActiveTab('profile'); // Switch to main profile dashboard for newly selected role
  };

  const handleNavigateTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTour = () => {
    setActiveRole(USER_ROLES.STUDENT);
    setActiveTab('profile');
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
        rolesList={rolesList}
        activeRoleId={activeRole.id}
        onSelectRole={handleSelectRole}
      />

      {/* 2. Role-Customized Segmented Navigation */}
      <Navigation activeTabId={activeTab} onSelectTab={handleNavigateTab} activeRole={activeRole} />

      {/* 3. Main Content Area */}
      <main className="main-content">
        {/* Dynamic Content based on Selected Role */}
        {activeRole.id === 'mentor' && (
          <MentorView activeTab={activeTab} onNavigateTab={handleNavigateTab} />
        )}

        {activeRole.id === 'parent' && (
          <ParentView activeTab={activeTab} />
        )}

        {activeRole.id === 'employer' && (
          <EmployerView activeTab={activeTab} />
        )}

        {/* Student Default Role Content */}
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
      </main>

      {/* 4. Floating AI Assistant */}
      <AiAssistantWidget />

      {/* 5. Modern Footer */}
      <Footer />
    </div>
  );
}

export default App;
