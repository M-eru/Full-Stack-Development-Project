const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const Card = db.define('card',
    {
        cardName: { type: Sequelize.STRING },
        cardNo: { type: Sequelize.STRING(19) },
        expiryDate: { type: Sequelize.DATE },
        ccv: { type: Sequelize.STRING(4) },
        debitCredit: { type: Sequelize.STRING }
    },
    {
      timestamps: false
    });

module.exports = Card;