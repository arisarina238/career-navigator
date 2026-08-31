const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Вспомогательная функция для HTTP запросов с fallback'ом и авторизацией
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('career_token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // 0. Аутентификация и сессии
  register: ({ firstName, lastName, email, password, role }) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, role })
    }),

  login: ({ email, password, role }) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    }),

  getMe: () => request('/api/auth/me'),

  logout: () => {
    localStorage.removeItem('career_token');
    localStorage.removeItem('career_user');
  },

  setSession: (token, user) => {
    if (token) localStorage.setItem('career_token', token);
    if (user) localStorage.setItem('career_user', JSON.stringify(user));
  },

  getCurrentUser: () => {
    try {
      const u = localStorage.getItem('career_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem('career_token'),

  // 1. Роли и профили
  getRoles: () => request('/api/users/roles'),
  getStudentProfile: () => request('/api/profile/student'),
  updateStudentProfile: (data) =>
    request('/api/profile/student', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // 2. Диагностика
  getDiagnosticQuestions: () => request('/api/diagnostics/questions'),
  getDiagnosticResult: () => request('/api/diagnostics/result'),
  submitDiagnosticQuiz: (answers) =>
    request('/api/diagnostics/submit', {
      method: 'POST',
      body: JSON.stringify({ answers })
    }),

  // 3. Зоны и Профпробы
  getAituZones: () => request('/api/zones'),
  bookProTrial: (trialId) =>
    request(`/api/trials/${trialId}/book`, {
      method: 'POST'
    }),

  // 4. Карьерный маршрут
  getCareerRoadmap: () => request('/api/roadmap'),

  // 5. Работодатели и вакансии
  getEmployers: () => request('/api/employers'),
  applyToVacancy: (vacancyId, coverLetter) =>
    request(`/api/vacancies/${vacancyId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter })
    }),

  // 6. Кабинет наставника
  getMentorProfile: () => request('/api/mentor/profile'),
  getMentorStudents: () => request('/api/mentor/students'),
  addMentorNote: (studentId, comment) =>
    request(`/api/mentor/students/${studentId}/note`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    }),
  bulkBookMentorTrial: (trialId) =>
    request('/api/mentor/bulk-book', {
      method: 'POST',
      body: JSON.stringify({ trialId })
    }),

  // 7. Кабинет родителя
  getParentProfile: () => request('/api/parent/profile'),
  getParentApprovals: () => request('/api/parent/approvals'),
  respondParentApproval: (approvalId, status) =>
    request(`/api/parent/approvals/${approvalId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),

  // 8. Кабинет работодателя
  getEmployerProfile: () => request('/api/employer/profile'),
  getEmployerApplicants: () => request('/api/employer/applicants'),
  createEmployerVacancy: (data) =>
    request('/api/employer/vacancies', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateApplicationStatus: (applicationId, status) =>
    request(`/api/employer/applications/${applicationId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),

  // 9. ИИ-Ассистент
  sendChatMessage: (message, scenario = 'A', stage = 'interests', sessionId = null) =>
    request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, scenario, stage, sessionId })
    }),
  getAssistantHistory: (sessionId = null) =>
    request(`/api/assistant/history${sessionId ? `?sessionId=${sessionId}` : ''}`),
  getAssistantFacts: () => request('/api/assistant/facts'),
  addAssistantFact: (data) =>
    request('/api/assistant/facts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteAssistantFact: (factId) =>
    request(`/api/assistant/facts/${factId}`, {
      method: 'DELETE'
    }),
  getAssistantRecommendations: () => request('/api/assistant/recommendations'),
  dismissAssistantRecommendation: (recId) =>
    request(`/api/assistant/recommendations/${recId}/dismiss`, {
      method: 'POST'
    })
};

export default api;
