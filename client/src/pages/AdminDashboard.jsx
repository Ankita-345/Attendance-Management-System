import { useState, useEffect } from 'react';
import moment from 'moment';
import Navbar from '../components/Navbar';
import api from '../services/api';
import EmployeeModal from '../components/EmployeeModal';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all', 'today', 'month'
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [markingAbsent, setMarkingAbsent] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load employees
      const employeesResponse = await api.getEmployees();
      setEmployees(employeesResponse.data);
      setFilteredEmployees(employeesResponse.data); // Initialize filtered list

      // Load recent attendance records
      const attendanceResponse = await api.getAttendance({
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD')
      });
      setAttendanceRecords(attendanceResponse.data);
      setFilteredAttendance(attendanceResponse.data); // Initialize filtered attendance
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search/filter employees
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(employee => {
      const searchLower = searchTerm.toLowerCase();
      return (
        employee.name?.toLowerCase().includes(searchLower) ||
        employee.employeeId?.toLowerCase().includes(searchLower) ||
        employee.department?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower) ||
        employee.role?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Attendance filtering logic
  useEffect(() => {
    let filtered = [...attendanceRecords];

    // Apply employee filter
    if (selectedEmployee) {
      filtered = filtered.filter(record => 
        record.Employee?.employeeId === selectedEmployee
      );
    }

    // Apply time filter
    const now = moment();
    if (attendanceFilter === 'today') {
      filtered = filtered.filter(record => 
        moment(record.date).isSame(now, 'day')
      );
    } else if (attendanceFilter === 'month') {
      filtered = filtered.filter(record => 
        moment(record.date).isSame(now, 'month')
      );
    }

    setFilteredAttendance(filtered);
  }, [attendanceRecords, attendanceFilter, selectedEmployee]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employeeIdentifier) => {
    // Handle case where employeeIdentifier might be the full employee object
    const employeeId = typeof employeeIdentifier === 'object' 
      ? (employeeIdentifier.id || employeeIdentifier._id || employeeIdentifier.employeeId)
      : employeeIdentifier;
    
    if (!employeeId) {
      alert('Employee ID not found');
      return;
    }
    
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await api.deleteEmployee(employeeId);
        loadDashboardData(); // Refresh data
      } catch (error) {
        alert('Failed to delete employee: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleMarkAbsent = async (employeeId, date = new Date().toISOString().split('T')[0]) => {
    const key = `${employeeId}-${date}`;
    setMarkingAbsent(prev => ({ ...prev, [key]: true }));
    
    try {
      await api.markAbsent(employeeId, date);
      // Refresh attendance data
      loadDashboardData();
      alert('Employee marked as absent successfully');
    } catch (error) {
      alert('Failed to mark absent: ' + (error.response?.data?.message || error.message));
    } finally {
      setMarkingAbsent(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleEmployeeModalClose = () => {
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  };

  const handleEmployeeSave = () => {
    loadDashboardData(); // Refresh data
    handleEmployeeModalClose();
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
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Unknown</span>;
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage employees and attendance records
              </p>
            </div>
            <button
              onClick={handleAddEmployee}
              className="mt-4 sm:mt-0 btn-primary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Employee
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 pb-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {employees.length}
                          {searchTerm && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({filteredEmployees.length} filtered)
                            </span>
                          )}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Present Today</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {attendanceRecords.filter(r => 
                            moment(r.date).isSame(moment(), 'day') && 
                            (r.status === 'present' || r.status === 'late')
                          ).length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Late Today</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {attendanceRecords.filter(r => 
                            moment(r.date).isSame(moment(), 'day') && 
                            r.status === 'late'
                          ).length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Management Section */}
        <div className="px-4 pb-6 sm:px-0">
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Employee Management</h2>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-normal"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handleAddEmployee}
                  className="btn-primary flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Employee
                </button>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id || employee._id || employee.employeeId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.employeeId}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {moment(employee.joiningDate).format('MMM DD, YYYY')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id || employee._id || employee.employeeId)}
                            className="text-red-600 hover:text-red-900 mr-4"
                          >
                            Deactivate
                          </button>
                          <button
                            onClick={() => handleMarkAbsent(employee.id || employee._id || employee.employeeId)}
                            disabled={markingAbsent[`${employee.id || employee._id || employee.employeeId}-${new Date().toISOString().split('T')[0]}`]}
                            className={`${
                              markingAbsent[`${employee.id || employee._id || employee.employeeId}-${new Date().toISOString().split('T')[0]}`]
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700 text-white'
                            } px-3 py-1 rounded text-xs font-medium transition duration-200`}
                          >
                            {markingAbsent[`${employee.id || employee._id || employee.employeeId}-${new Date().toISOString().split('T')[0]}`] 
                              ? 'Marking...' 
                              : 'Mark Absent'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Attendance Records */}
        <div className="px-4 sm:px-0">
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Attendance Records</h2>
              <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                {/* Time Filter */}
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-600 self-center">Filter:</span>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="input-field text-sm py-1"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                {/* Employee Filter */}
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-600 self-center">Employee:</span>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="input-field text-sm py-1"
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
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
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.slice(0, 20).map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {/* Fixed employee display based on actual backend response */}
                          {record.Employee 
                            ? `${record.Employee.name} (${record.Employee.employeeId}) - ${record.Employee.User?.username || ''}`
                            : `Employee ID: ${record.employeeId || 'Unknown'}`
                          }
                        </td>
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
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        {attendanceFilter === 'today' 
                          ? 'No attendance records for today' 
                          : attendanceFilter === 'month'
                          ? 'No attendance records for this month'
                          : selectedEmployee
                          ? `No attendance records for ${employees.find(e => e.employeeId === selectedEmployee)?.name || selectedEmployee}`
                          : 'No attendance records found'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={handleEmployeeModalClose}
          onSave={handleEmployeeSave}
        />
      )}
    </div>
  );
};

export default AdminDashboard;