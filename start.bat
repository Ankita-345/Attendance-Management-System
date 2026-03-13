@echo off
echo Starting Attendance Management System...
echo ======================================

echo Starting backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo Servers started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
echo Use the following credentials to login:
echo Admin: username: admin, password: admin123
echo Employee: username: emp001, password: employee123
echo.
pause