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
  year: { type: Sequelize.INTEGER(1), allowNull: true},
  status: { type: Sequelize.STRING }
});

ParentTutor.sync();

// Creates tutor accounts if they don't exist
ParentTutor.findOrCreate({
  where: { id: 1 },
  defaults: {
    name: 'Jack',
    email: 'myacademy1@email.com',
    password: bcrypt.hashSync('qwerty', bcrypt.genSaltSync(10)),
    role: 'tutor',
    year: 1,
    status: 'active',
  },
});

module.exports = ParentTutor;