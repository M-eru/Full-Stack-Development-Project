const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create users table in MySQL Database
const Badge = db.define('badge',
    {
        badgename: { type: Sequelize.STRING },
        points: { type: Sequelize.INTEGER },
        color: { type: Sequelize.STRING }
        // icon: { type: Sequelize.STRING }
    });

module.exports = Badge;