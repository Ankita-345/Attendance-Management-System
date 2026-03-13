import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('employee');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async resetPassword(data) {
    const response = await this.api.post('/auth/reset-password', data);
    return response.data;
  }

  // Employee endpoints
  async getEmployees() {
    const response = await this.api.get('/employees');
    return response.data;
  }

  async createEmployee(employeeData) {
    const response = await this.api.post('/employees', employeeData);
    return response.data;
  }

  async updateEmployee(id, employeeData) {
    const response = await this.api.put(`/employees/${id}`, employeeData);
    return response.data;
  }

  async deleteEmployee(id) {
    const response = await this.api.delete(`/employees/${id}`);
    return response.data;
  }

  // Attendance endpoints
  async checkIn(employeeId = null) {
    const data = employeeId ? { employeeId } : {};
    const response = await this.api.post('/attendance/check-in', data);
    return response.data;
  }

  async checkOut(employeeId = null) {
    const data = employeeId ? { employeeId } : {};
    const response = await this.api.post('/attendance/check-out', data);
    return response.data;
  }

  async getAttendance(params = {}) {
    const response = await this.api.get('/attendance', { params });
    return response.data;
  }

  async getMyAttendance() {
    const response = await this.api.get('/attendance/my-records');
    return response.data;
  }

  async getTodayStatus(employeeId = null) {
    const params = employeeId ? { employeeId } : {};
    const response = await this.api.get('/attendance/today', { params });
    return response.data;
  }

  async getReport(params) {
    const response = await this.api.get('/attendance/report', { params });
    return response.data;
  }

  async markAbsent(employeeId, date) {
    const response = await this.api.post('/attendance/mark-absent', { employeeId, date });
    return response.data;
  }
}

const api = new ApiService();
export default api;