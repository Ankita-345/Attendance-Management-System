const User = require('../models/User');
const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private/Admin
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['username']
      }]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
  const { employeeId, name, email, department, role, joiningDate, username, password } = req.body;

  try {
    // Validate required fields
    if (!employeeId || !name || !email || !department || !role || !joiningDate || !username || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if employee ID already exists
    const employeeExists = await Employee.findOne({ where: { employeeId } });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if email already exists
    const emailExists = await Employee.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if username already exists
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create user first
    const user = await User.create({
      username,
      password,
      role: 'employee'
    });

    // Create employee
    const employee = await Employee.create({
      userId: user.id,
      employeeId,
      name,
      email,
      department,
      role,
      joiningDate: new Date(joiningDate)
    });

    // Fetch with user data
    const employeeWithUser = await Employee.findByPk(employee.id, {
      include: [{
        model: User,
        attributes: ['username']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employeeWithUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  const { name, email, department, role, joiningDate, isActive } = req.body;

  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (department) employee.department = department;
    if (role) employee.role = role;
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (isActive !== undefined) employee.isActive = isActive;

    await employee.save();

    // Also update user if needed
    if (req.body.username || req.body.password) {
      const user = await User.findByPk(employee.userId);
      if (user) {
        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = req.body.password;
        await user.save();
      }
    }

    // Fetch with user data
    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [{
        model: User,
        attributes: ['username']
      }]
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete - set isActive to false
    employee.isActive = false;
    await employee.save();

    // Also deactivate user account
    const user = await User.findByPk(employee.userId);
    if (user) {
      user.isActive = false;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Employee deactivated successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};