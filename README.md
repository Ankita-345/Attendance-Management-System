# Attendance Management System

A complete web-based attendance management system built with React, Node.js, Express, and **MySQL**. This system allows employees to mark their attendance and administrators to manage employees and generate attendance reports.

## Features

### For Employees:
- ✅ Login with username and password
- ✅ Mark daily check-in and check-out
- ✅ View personal attendance history
- ✅ Real-time attendance status updates

### For Administrators:
- ✅ Employee management (add, edit, deactivate)
- ✅ View all attendance records
- ✅ Generate attendance reports
- ✅ Dashboard with attendance statistics
- ✅ Filter records by date, employee, or department

## Tech Stack

### Frontend:
- React 18
- React Router DOM
- Tailwind CSS
- Axios for API calls
- Moment.js for date handling

### Backend:
- Node.js
- Express.js
- **MySQL with Sequelize ORM**
- JWT for authentication
- Bcrypt for password hashing
- CORS for cross-origin requests

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)
- **MySQL Server** (local installation or remote MySQL server)

## Installation

### Option 1: Using Local MySQL (Recommended)

1. **Install MySQL locally:**
   - **Windows**: Download XAMPP from https://www.apachefriends.org/ (includes MySQL)
   - **macOS**: Use Homebrew: `brew install mysql`
   - **Linux**: `sudo apt install mysql-server`

2. **Start MySQL service:**
   - XAMPP: Start MySQL from XAMPP Control Panel
   - Command line: `sudo service mysql start` (Linux) or `brew services start mysql` (macOS)

3. **Create database:**
```sql
CREATE DATABASE attendance_management;
```

4. **Clone and setup the project:**
```bash
git clone <repository-url>
cd "Attendance Management System"
```

5. **Install dependencies:**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Option 2: Using Docker (MySQL Container)

1. **Install Docker Desktop**

2. **Start MySQL container:**
```bash
docker run --name mysql-ams -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=attendance_management -p 3306:3306 -d mysql:8.0
```

### Option 3: Using Remote MySQL Server

1. **Get connection details** from your hosting provider
2. **Update environment variables** in `server/.env`

## Configuration

### Update Environment Variables

Edit `server/.env` file:

```env
NODE_ENV=development
PORT=5000

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=attendance_management
DB_USER=root
DB_PASSWORD=your_mysql_password_here

JWT_SECRET=attendance_management_jwt_secret_key_2024
CLIENT_URL=http://localhost:5173
```

### For XAMPP users:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=attendance_management
DB_USER=root
DB_PASSWORD=          # Leave empty for XAMPP default
```

## Running the Application

### Method 1: Run both servers simultaneously (Recommended)

From the root directory:
```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 5173) servers.

### Method 2: Run servers separately

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend server (in a new terminal):**
```bash
cd client
npm run dev
```

## Initial Setup

### Seeding Sample Data

To populate the database with sample data including admin and employee accounts:

```bash
cd server
node seeder.js
```

This will create:
- **Admin Account:**
  - Username: `admin`
  - Password: `admin123`

- **Employee Accounts:**
  - Username: `emp001`, Password: `employee123`
  - Username: `emp002`, Password: `employee123`
  - Username: `emp003`, Password: `employee123`
  - Username: `emp004`, Password: `employee123`

### Accessing the Application

1. Open your browser and go to: `http://localhost:5173`
2. Login with the credentials above
3. Admins will be redirected to `/admin` dashboard
4. Employees will be redirected to `/employee` dashboard

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Reset password

### Employee Management (Admin only)
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Deactivate employee

### Attendance
- `POST /api/attendance/check-in` - Mark check-in
- `POST /api/attendance/check-out` - Mark check-out
- `GET /api/attendance/today` - Get today's attendance status
- `GET /api/attendance/my-records` - Get own attendance records
- `GET /api/attendance` - Get attendance records (Admin only)
- `GET /api/attendance/report` - Generate attendance report (Admin only)

## Project Structure

```
attendance-management-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (Auth)
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API service calls
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   └── package.json
├── server/                    # Node.js backend
│   ├── config/               # Database configuration
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── server.js             # Entry point
│   ├── seeder.js             # Sample data seeder
│   └── package.json
├── docker-compose.yml         # Docker configuration
└── README.md
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication with 1-hour expiry
- Role-based access control (Admin/Employee)
- CORS configuration
- Rate limiting for API requests
- Input validation and sanitization

## Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_management
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - For Atlas, ensure IP whitelist includes your IP

2. **Port already in use:**
   - Change PORT in server `.env` file
   - Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -i :5000
   kill -9 <PID>
   ```

3. **CORS Error:**
   - Ensure CLIENT_URL in `.env` matches frontend URL
   - Restart both servers after changes

4. **Login not working:**
   - Run the seeder script to create sample users
   - Check browser console for API errors
   - Verify backend server is running

## Development

### Adding New Features:

1. **Backend:**
   - Add new routes in `server/routes/`
   - Create controllers in `server/controllers/`
   - Update models if needed in `server/models/`

2. **Frontend:**
   - Create new components in `client/src/components/`
   - Add new pages in `client/src/pages/`
   - Update routing in `client/src/App.jsx`

### Code Quality:
- Follow existing code patterns
- Use proper error handling
- Maintain consistent styling with Tailwind CSS
- Test API endpoints thoroughly

## Deployment

### Backend Deployment Options:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

### Frontend Deployment Options:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Production Considerations:
- Set `NODE_ENV=production`
- Use environment variables for secrets
- Implement proper logging
- Add monitoring and error tracking
- Set up automated backups for database
- Configure SSL certificates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email@example.com] or open an issue in the repository.

---

**Note:** This is a demonstration project. For production use, implement additional security measures and proper error handling.