const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const bcrypt = require('bcryptjs');

// Create users table in MySQL Database
const ParentTutor = db.define('parentTutor',
{
  name: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  role: { type: Sequelize.STRING },
  status: { type: Sequelize.STRING }
});

module.exports = ParentTutor;