import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5170/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clinicgo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('clinicgo_token');
      localStorage.removeItem('clinicgo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Appointments ──────────────────────────────────────
export const appointmentAPI = {
  getSlots:       (doctorId, date) => api.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`),
  book:           (data)           => api.post('/appointments', data),
  confirm:        (id)             => api.put(`/appointments/${id}/confirm`),
  cancel:         (id)             => api.put(`/appointments/${id}/cancel`),
  complete:       (id)             => api.put(`/appointments/${id}/complete`),
  getById:        (id)             => api.get(`/appointments/${id}`),
  getTodayByDoctor: (doctorId)     => api.get(`/appointments/doctor/${doctorId}/today`),
  getByPatient:   (patientId)      => api.get(`/appointments/patient/${patientId}`),
};

// ── Patients ──────────────────────────────────────────
export const patientAPI = {
  getPending: ()     => api.get('/patients/pending'),
  approve:    (id)   => api.put(`/patients/${id}/approve`),
  reject:     (id)   => api.put(`/patients/${id}/reject`),
  getHistory: (id)   => api.get(`/patients/${id}/history`),
  search:     (name) => api.get(`/patients${name ? `?name=${name}` : ''}`),
};

// ── Prescriptions ─────────────────────────────────────
export const prescriptionAPI = {
  create:       (data)          => api.post('/prescriptions', data),
  getByAppt:    (appointmentId) => api.get(`/prescriptions/${appointmentId}`),
  getByPatient: (patientId)     => api.get(`/prescriptions/patient/${patientId}`),
};

// ── Payments ──────────────────────────────────────────
export const paymentAPI = {
  initiate:       (data)        => api.post('/payments/initiate', data),
  recordCash:     (data)        => api.post('/payments/record-cash', data),
  getByAppt:      (apptId)      => api.get(`/payments/${apptId}`),
  getHistory:     (patientId)   => api.get(`/payments/patient/${patientId}/history`),
  refund:         (paymentId)   => api.post(`/payments/${paymentId}/refund`),
};

// ── Queue ─────────────────────────────────────────────
export const queueAPI = {
  getToday: (doctorId)     => api.get(`/queue/today/${doctorId}`),
  next:     (appointmentId) => api.put(`/queue/${appointmentId}/next`),
  skip:     (appointmentId) => api.put(`/queue/${appointmentId}/skip`),
};

// ── Admin ─────────────────────────────────────────────
export const adminAPI = {
  getDoctors:       ()     => api.get('/admin/doctors'),
  createDoctor:     (data) => api.post('/admin/doctors', data),
  updateDoctor:     (id, data) => api.put(`/admin/doctors/${id}`, data),
  deactivateDoctor: (id)   => api.delete(`/admin/doctors/${id}`),
  getStaff:         ()     => api.get('/admin/staff'),
  createStaff:      (data) => api.post('/admin/staff', data),
  getSnapshot:      ()     => api.get('/admin/analytics/snapshot'),
  computeAnalytics: ()     => api.post('/admin/analytics/compute'),
};

// ── Lab Reports ───────────────────────────────────────
export const labAPI = {
  upload:      (formData)   => api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
  download:     (reportId)  => api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
};

// ── Chat ──────────────────────────────────────────────
export const chatAPI = {
  getHistory: (appointmentId) => api.get(`/chat/history/${appointmentId}`),
};
