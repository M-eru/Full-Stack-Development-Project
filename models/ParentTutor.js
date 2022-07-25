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
    name: 'Tutor-1',
    email: 'myacademy1@email.com',
    password: 'qwerty',
    role: 'tutor',
    year: 1,
    status: 'active',
  },
});

ParentTutor.findOrCreate({
  where: { id: 2 },
  defaults: {
    name: 'Tutor-2',
    email: 'myacademy2@email.com',
    password: 'qwerty',
    role: 'tutor',
    year: 2,
    status: 'active',
  },
});

module.exports = ParentTutor;