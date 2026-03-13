const dotenv = require('dotenv');
const User = require('./models/User');
const Employee = require('./models/Employee');
const { connectDB, sequelize } = require('./config/db');

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.destroy({ where: {} });
    await Employee.destroy({ where: {} });

    console.log('Existing data cleared...');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created...');

    // Create sample employees
    const employeesData = [
      {
        employeeId: 'EMP001',
        name: 'John Smith',
        email: 'john.smith@company.com',
        department: 'Engineering',
        role: 'Software Developer',
        joiningDate: new Date('2023-01-15'),
        username: 'emp001',
        password: 'employee123'
      },
      {
        employeeId: 'EMP002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Marketing',
        role: 'Marketing Specialist',
        joiningDate: new Date('2023-03-20'),
        username: 'emp002',
        password: 'employee123'
      },
      {
        employeeId: 'EMP003',
        name: 'Mike Davis',
        email: 'mike.davis@company.com',
        department: 'HR',
        role: 'HR Manager',
        joiningDate: new Date('2022-11-10'),
        username: 'emp003',
        password: 'employee123'
      },
      {
        employeeId: 'EMP004',
        name: 'Emily Wilson',
        email: 'emily.wilson@company.com',
        department: 'Finance',
        role: 'Accountant',
        joiningDate: new Date('2023-06-05'),
        username: 'emp004',
        password: 'employee123'
      }
    ];

    for (const empData of employeesData) {
      // Create user
      const user = await User.create({
        username: empData.username,
        password: empData.password,
        role: 'employee'
      });

      // Create employee record
      await Employee.create({
        userId: user.id,
        employeeId: empData.employeeId,
        name: empData.name,
        email: empData.email,
        department: empData.department,
        role: empData.role,
        joiningDate: empData.joiningDate
      });

      console.log(`Created employee: ${empData.name}`);
    }

    console.log('Sample data seeded successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\nEmployees:');
    console.log('  Username: emp001, Password: employee123');
    console.log('  Username: emp002, Password: employee123');
    console.log('  Username: emp003, Password: employee123');
    console.log('  Username: emp004, Password: employee123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Destroy data
  const destroyData = async () => {
    try {
      await User.destroy({ where: {} });
      await Employee.destroy({ where: {} });
      
      console.log('Data destroyed...');
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
  
  destroyData();
} else {
  seedData();
}