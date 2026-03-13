@echo off
echo Attendance Management System Setup Script
echo ========================================

echo Installing root dependencies...
npm install

echo Installing server dependencies...
cd server
npm install

echo Installing client dependencies...
cd ../client
npm install

echo.
echo Setup complete!
echo.
echo To run the application:
echo 1. Make sure MongoDB is running
echo 2. From the root directory, run: npm run dev
echo.
echo Default credentials:
echo Admin: username: admin, password: admin123
echo Employee: username: emp001, password: employee123
echo.
pause