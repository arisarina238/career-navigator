const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Вспомогательная функция для HTTP запросов с fallback'ом
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
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
  // 1. Роли и профили
  getRoles: () => request('/api/users/roles'),
  getStudentProfile: () => request('/api/profile/student'),

  // 2. Диагностика
  getDiagnosticQuestions: () => request('/api/diagnostics/questions'),
  submitDiagnosticQuiz: (answers, studentId) =>
    request('/api/diagnostics/submit', {
      method: 'POST',
      body: JSON.stringify({ answers, studentId })
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
  getMentorStudents: () => request('/api/mentor/students'),
  addMentorNote: (studentId, comment) =>
    request(`/api/mentor/students/${studentId}/note`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    }),

  // 7. Кабинет родителя
  getParentApprovals: () => request('/api/parent/approvals'),
  respondParentApproval: (approvalId, status) =>
    request(`/api/parent/approvals/${approvalId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),

  // 8. ИИ-Ассистент
  sendChatMessage: (message, scenario = 'A', stage = 'interests', sessionId = null) =>
    request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, scenario, stage, sessionId })
    })
};

export default api;
