const express = require('express');
const router = express.Router();
const { 
  checkIn, 
  checkOut, 
  getAttendance, 
  getReport,
  getTodayStatus
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);

// Admin routes (with admin authorization)
router.get('/', authorize('admin'), getAttendance);
router.get('/report', authorize('admin'), getReport);

// Employee can also view their own attendance
router.get('/my-records', getAttendance);

module.exports = router;