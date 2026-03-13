import { useState, useEffect } from 'react';
import moment from 'moment';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EmployeeDashboard = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [myAttendance, setMyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const { employee } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's status
      const todayResponse = await api.getTodayStatus();
      setTodayStatus(todayResponse.data);

      // Get recent attendance records
      const attendanceResponse = await api.getMyAttendance();
      setMyAttendance(attendanceResponse.data.slice(0, 10)); // Last 10 records
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const response = await api.checkIn();
      setTodayStatus(response.data);
      loadDashboardData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      const response = await api.checkOut();
      setTodayStatus(response.data);
      loadDashboardData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="status-present">Present</span>;
      case 'late':
        return <span className="status-late">Late</span>;
      case 'absent':
        return <span className="status-absent">Absent</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Not Marked</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome, {employee?.name} ({employee?.employeeId})
          </p>
        </div>

        {/* Today's Attendance Card */}
        <div className="px-4 pb-6 sm:px-0">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-800 font-medium">Status</div>
                <div className="mt-1">
                  {getStatusBadge(todayStatus?.status || 'not-marked')}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-800 font-medium">Check-in Time</div>
                <div className="mt-1 text-lg font-semibold text-green-900">
                  {todayStatus?.checkIn 
                    ? moment(todayStatus.checkIn).format('HH:mm A') 
                    : '--:--'}
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-800 font-medium">Check-out Time</div>
                <div className="mt-1 text-lg font-semibold text-purple-900">
                  {todayStatus?.checkOut 
                    ? moment(todayStatus.checkOut).format('HH:mm A') 
                    : '--:--'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheckIn}
                disabled={checkingIn || todayStatus?.checkIn}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center ${
                  todayStatus?.checkIn
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {checkingIn ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking In...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Check In
                  </>
                )}
              </button>

              <button
                onClick={handleCheckOut}
                disabled={checkingOut || !todayStatus?.checkIn || todayStatus?.checkOut}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center ${
                  !todayStatus?.checkIn || todayStatus?.checkOut
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {checkingOut ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking Out...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Check Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Attendance Records */}
        <div className="px-4 sm:px-0">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance Records</h2>
            
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myAttendance.length > 0 ? (
                    myAttendance.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {moment(record.date).format('MMM DD, YYYY')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.checkIn ? moment(record.checkIn).format('HH:mm A') : '--:--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.checkOut ? moment(record.checkOut).format('HH:mm A') : '--:--'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;