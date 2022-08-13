const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create student table in MySQL Database
const Student = db.define('student',
{
  name: { type: Sequelize.STRING },
  admno: { type: Sequelize.STRING(7) },
  password: { type: Sequelize.STRING },
  role: { type: Sequelize.STRING },
  year: { type: Sequelize.INTEGER(1)},
  status: { type: Sequelize.STRING },
  totalScore: { type: Sequelize.INTEGER, defaultValue: 0 },
},
{
  timestamps: false
});

module.exports = Student;