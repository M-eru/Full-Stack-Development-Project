const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create students table in MySQL Database
const Student = db.define('student',
{
  name: { type: Sequelize.STRING },
  admno: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  role: { type: Sequelize.STRING },
  status: { type: Sequelize.STRING }
});

module.exports = Student;