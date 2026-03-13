import api from './api';

class AuthService {
  async login(username, password) {
    try {
      const response = await api.login({ username, password });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  async logout() {
    try {
      await api.logout();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Logout failed' 
      };
    }
  }

  async resetPassword(currentPassword, newPassword) {
    try {
      const response = await api.resetPassword({ currentPassword, newPassword });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      };
    }
  }
}

const authService = new AuthService();
export default authService;