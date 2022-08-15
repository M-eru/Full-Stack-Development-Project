const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const Payment_Duration = db.define('payment_duration',
    {
        studentId: { type: Sequelize.INTEGER },
        startDate: { type: Sequelize.DATE },
        endDate1: { type: Sequelize.DATE },
        endDate3: { type: Sequelize.DATE },
        endDate6: { type: Sequelize.DATE },
        actualEnd: { type: Sequelize.DATE },
        payed: { type: Sequelize.BOOLEAN, defaultValue: false }
    },
    {
      timestamps: false
    });

Payment_Duration.sync();

module.exports = Payment_Duration;