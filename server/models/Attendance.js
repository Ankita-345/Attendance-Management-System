const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  checkIn: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkOut: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isAfterCheckIn(value) {
        if (value && this.checkIn && value <= this.checkIn) {
          throw new Error('Check-out time must be after check-in time');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half-day'),
    defaultValue: 'absent'
  },
  lateMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'attendances'
});

// Associations
Employee.hasMany(Attendance, { foreignKey: 'employeeId' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

// Hook to calculate late minutes
Attendance.addHook('beforeSave', (attendance) => {
  if (attendance.checkIn && attendance.status === 'late') {
    const officeStartTime = new Date(attendance.date);
    officeStartTime.setHours(9, 0, 0, 0); // 9 AM
    
    if (attendance.checkIn > officeStartTime) {
      const diffMs = attendance.checkIn - officeStartTime;
      attendance.lateMinutes = Math.floor(diffMs / 60000); // Convert to minutes
    }
  }
});

// Static method to get attendance summary
Attendance.getSummary = async function(employeeId, startDate, endDate) {
  return await sequelize.query(`
    SELECT 
      COUNT(*) as totalDays,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentDays,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as lateDays,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absentDays,
      SUM(lateMinutes) as totalLateMinutes
    FROM attendances 
    WHERE employeeId = ? AND date BETWEEN ? AND ?
  `, {
    replacements: [employeeId, startDate, endDate],
    type: sequelize.QueryTypes.SELECT
  });
};

module.exports = Attendance;