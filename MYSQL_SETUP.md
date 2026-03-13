# MySQL Setup Guide for Attendance Management System

## Prerequisites

1. **Install MySQL Server**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP for easier setup on Windows

2. **Install MySQL Client Tools** (optional but recommended)
   - MySQL Workbench
   - phpMyAdmin

## MySQL Installation Options

### Option 1: XAMPP (Windows - Easiest)
1. Download XAMPP from https://www.apachefriends.org/
2. Install and start Apache and MySQL services
3. Access phpMyAdmin at http://localhost/phpmyadmin
4. Default MySQL port: 3306
5. Default username: root (no password)

### Option 2: MySQL Installer (Windows)
1. Download MySQL Installer from Oracle website
2. Choose "Developer Default" setup
3. Set root password during installation
4. Default port: 3306

### Option 3: Docker (Cross-platform)
```bash
docker run --name mysql-ams -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=attendance_management -p 3306:3306 -d mysql:8.0
```

## Database Setup

### 1. Create Database
Using MySQL command line or phpMyAdmin:

```sql
CREATE DATABASE attendance_management;
```

### 2. Configure Environment Variables
Update `server/.env` file:

```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=attendance_management
DB_USER=root
DB_PASSWORD=your_mysql_password_here
```

### 3. Install Dependencies
```bash
cd server
npm install
```

### 4. Seed Sample Data
```bash
node seeder.js
```

This will create:
- Admin user: `admin` / `admin123`
- 4 sample employees with credentials

## MySQL Connection Strings

### Local MySQL
```
mysql://root:@localhost:3306/attendance_management
```

### With Password
```
mysql://root:yourpassword@localhost:3306/attendance_management
```

### Remote MySQL
```
mysql://username:password@hostname:3306/attendance_management
```

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Ensure MySQL service is running
   - Check if port 3306 is not blocked
   - Verify credentials in .env file

2. **Access Denied**
   - Check username/password in .env
   - Ensure user has proper privileges
   - For root user, you might need to create a dedicated user:

```sql
CREATE USER 'ams_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON attendance_management.* TO 'ams_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Database Doesn't Exist**
   - Create the database manually:
   ```sql
   CREATE DATABASE attendance_management;
   ```

4. **Table Creation Errors**
   - Ensure Sequelize can connect to database
   - Check MySQL version compatibility (8.0+ recommended)

## Migration from MongoDB

If you're migrating from MongoDB:

1. Export data from MongoDB
2. Create MySQL database structure
3. Convert data formats
4. Import data into MySQL
5. Update application code (already done in this version)

## Performance Tips

1. **Indexes**: The system automatically creates indexes on frequently queried fields
2. **Connection Pooling**: Configured in db.js with pool settings
3. **Query Optimization**: Use Sequelize associations for efficient joins
4. **Monitoring**: Enable slow query log in MySQL for performance analysis

## Backup Strategy

### Manual Backup:
```bash
mysqldump -u root -p attendance_management > backup.sql
```

### Automated Backup (Linux/Cron):
```bash
0 2 * * * mysqldump -u root -pPASSWORD attendance_management > /backups/ams_$(date +\%Y\%m\%d).sql
```

## Security Considerations

1. **Strong Passwords**: Use complex passwords for MySQL users
2. **Firewall**: Restrict MySQL port access
3. **SSL**: Enable SSL connections for remote access
4. **Regular Updates**: Keep MySQL server updated
5. **Audit Logs**: Enable MySQL audit logging

## Development vs Production

### Development (.env):
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=attendance_management_dev
DB_USER=root
DB_PASSWORD=
```

### Production (.env.production):
```env
NODE_ENV=production
DB_HOST=your-production-host.com
DB_PORT=3306
DB_NAME=attendance_management
DB_USER=ams_prod_user
DB_PASSWORD=strong_production_password
```