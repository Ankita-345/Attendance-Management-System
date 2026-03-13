import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const employeeData = localStorage.getItem('employee');

    if (token && userData) {
      setUser(JSON.parse(userData));
      if (employeeData) {
        setEmployee(JSON.parse(employeeData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      
      if (response.success) {
        const { token, user, employee } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (employee) {
          localStorage.setItem('employee', JSON.stringify(employee));
          setEmployee(employee);
        }
        
        setUser(user);
        api.setAuthToken(token);
        
        return { success: true, user };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('employee');
    setUser(null);
    setEmployee(null);
    api.setAuthToken(null);
  };

  const value = {
    user,
    employee,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};