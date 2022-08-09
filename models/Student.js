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
  payed: { type: Sequelize.BOOLEAN, defaultValue: false },
  // Temporary columns for accessing parent details
  // When completed parent details should be accessed using FK instead
  tutorName: { type: Sequelize.STRING },
  tutorEmail: { type: Sequelize.STRING }
});

module.exports = Student;