const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Mark check-in
// @route   POST /api/attendance/check-in
// @access  Private/Employee
const checkIn = async (req, res) => {
  try {
    // For employees, use their own employee record
    // For admins, they can specify employeeId in request body
    let employeeId;
    
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found' });
      }
      employeeId = employee.id;
    } else {
      // Admin can specify employee
      employeeId = req.body.employeeId;
      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingRecord = await Attendance.findOne({
      where: {
        employeeId,
        date: today
      }
    });

    if (existingRecord && existingRecord.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const officeStartTime = new Date(today);
    officeStartTime.setHours(9, 0, 0, 0); // 9 AM

    let status = 'present';
    if (checkInTime > officeStartTime) {
      status = 'late';
    }

    let attendanceRecord;
    if (existingRecord) {
      // Update existing record
      existingRecord.checkIn = checkInTime;
      existingRecord.status = status;
      attendanceRecord = await existingRecord.save();
    } else {
      // Create new record
      attendanceRecord = await Attendance.create({
        employeeId,
        date: today,
        checkIn: checkInTime,
        status
      });
    }

    // Include employee info
    const recordWithEmployee = await Attendance.findByPk(attendanceRecord.id, {
      include: [{
        model: Employee,
        attributes: ['name', 'employeeId', 'department', 'role'],
        include: [{
          model: User,
          attributes: ['username']
        }]
      }]
    });

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: recordWithEmployee
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark check-out
// @route   POST /api/attendance/check-out
// @access  Private/Employee
const checkOut = async (req, res) => {
  try {
    let employeeId;
    
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found' });
      }
      employeeId = employee.id;
    } else {
      employeeId = req.body.employeeId;
      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendanceRecord = await Attendance.findOne({
      where: {
        employeeId,
        date: today
      }
    });

    if (!attendanceRecord) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendanceRecord.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendanceRecord.checkOut = new Date();
    await attendanceRecord.save();

    // Include employee info
    const recordWithEmployee = await Attendance.findByPk(attendanceRecord.id, {
      include: [{
        model: Employee,
        attributes: ['name', 'employeeId', 'department', 'role'],
        include: [{
          model: User,
          attributes: ['username']
        }]
      }]
    });

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: recordWithEmployee
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, department } = req.query;
    let whereClause = {};

    // For employees, only show their own records
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found' });
      }
      whereClause.employeeId = employee.id;
    } else if (employeeId) {
      // Admin can filter by specific employee
      whereClause.employeeId = employeeId;
    } else if (department) {
      // Admin can filter by department
      const employees = await Employee.findAll({ 
        where: { department, isActive: true },
        attributes: ['id']
      });
      whereClause.employeeId = { [require('sequelize').Op.in]: employees.map(emp => emp.id) };
    }

    // Date filtering
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[require('sequelize').Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[require('sequelize').Op.lte] = new Date(endDate);
    }

    const attendanceRecords = await Attendance.findAll({
      where: whereClause,
      include: [{
        model: Employee,
        attributes: ['name', 'employeeId', 'department', 'role'],
        include: [{
          model: User,
          attributes: ['username']
        }]
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private
const getReport = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    let whereClause = {
      date: {
        [require('sequelize').Op.gte]: new Date(startDate),
        [require('sequelize').Op.lte]: new Date(endDate)
      }
    };

    // Filter by employee or department
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found' });
      }
      whereClause.employeeId = employee.id;
    } else if (employeeId) {
      whereClause.employeeId = employeeId;
    } else if (department) {
      const employees = await Employee.findAll({ 
        where: { department, isActive: true },
        attributes: ['id']
      });
      whereClause.employeeId = { [require('sequelize').Op.in]: employees.map(emp => emp.id) };
    }

    const reportData = await Attendance.findAll({
      where: whereClause,
      attributes: [
        'employeeId',
        [require('sequelize').fn('COUNT', require('sequelize').col('Attendance.id')), 'totalDays'],
        [require('sequelize').fn('SUM', require('sequelize').literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), 'presentDays'],
        [require('sequelize').fn('SUM', require('sequelize').literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")), 'lateDays'],
        [require('sequelize').fn('SUM', require('sequelize').literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")), 'absentDays'],
        [require('sequelize').fn('SUM', require('sequelize').col('lateMinutes')), 'totalLateMinutes']
      ],
      group: ['employeeId'],
      include: [{
        model: Employee,
        attributes: ['name', 'employeeId', 'department'],
        include: [{
          model: User,
          attributes: ['username']
        }]
      }],
      order: [[require('sequelize').col('Employee.name'), 'ASC']]
    });

    // Format the data
    const formattedReport = reportData.map(record => {
      const totalDays = parseInt(record.dataValues.totalDays);
      const presentDays = parseInt(record.dataValues.presentDays) || 0;
      const lateDays = parseInt(record.dataValues.lateDays) || 0;
      const absentDays = parseInt(record.dataValues.absentDays) || 0;
      const totalLateMinutes = parseInt(record.dataValues.totalLateMinutes) || 0;
      
      return {
        employeeId: record.Employee.employeeId,
        employeeName: record.Employee.name,
        department: record.Employee.department,
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        totalLateMinutes,
        attendancePercentage: ((presentDays + lateDays) / totalDays * 100).toFixed(2)
      };
    });

    res.json({
      success: true,
      data: formattedReport,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private/Employee
const getTodayStatus = async (req, res) => {
  try {
    let employeeId;
    
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) {
        return res.status(404).json({ message: 'Employee record not found' });
      }
      employeeId = employee.id;
    } else {
      employeeId = req.query.employeeId;
      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecord = await Attendance.findOne({
      where: {
        employeeId,
        date: today
      },
      include: [{
        model: Employee,
        attributes: ['name', 'employeeId']
      }]
    });

    res.json({
      success: true,
      data: todayRecord || {
        employeeId,
        date: today,
        status: 'not-marked',
        checkIn: null,
        checkOut: null
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
  getReport,
  getTodayStatus
};