import axios from 'axios';

// Base URL for your Spring Boot backend
const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT token to every request automatically ──
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('careercompass:jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Handle 401 globally (token expired → redirect to login) ──
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('careercompass:jwt');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─────────────────────────────────────────────────────────────
//  Auth API
// ─────────────────────────────────────────────────────────────

export const authAPI = {
    /** Register a new student
     *  @param {{ name: string, email: string, password: string }} payload
     */
    register: (payload) => api.post('/auth/register', payload),

    /** Login as student / teacher / admin
     *  @param {{ email: string, password: string, role: 'student'|'teacher'|'admin' }} payload
     */
    login: (payload) => api.post('/auth/login', payload),
};

// ─────────────────────────────────────────────────────────────
//  User API
// ─────────────────────────────────────────────────────────────

export const userAPI = {
    /** GET /api/users/me — current user's profile */
    getMe: () => api.get('/users/me'),

    /** PUT /api/users/me — update profile fields */
    updateMe: (payload) => api.put('/users/me', payload),
};

// ─────────────────────────────────────────────────────────────
//  Test Attempts API
// ─────────────────────────────────────────────────────────────

export const testAPI = {
    /** GET /api/tests/attempts — all attempts for logged-in user */
    getAttempts: () => api.get('/tests/attempts'),

    /** POST /api/tests/attempts — save a new attempt
     *  @param {{ correct, total, percent, type, weekKey, domainScoresJson }} payload
     */
    saveAttempt: (payload) => api.post('/tests/attempts', payload),
};

export default api;
