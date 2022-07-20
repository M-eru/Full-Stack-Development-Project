const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const Student = db.define('student',
    {
        childName: { type: Sequelize.STRING },
        childAdmNo: { type: Sequelize.STRING(7) },
        tutorName: { type: Sequelize.STRING },
        tutorEmail: { type: Sequelize.STRING }
    });

module.exports = Student;