const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const Tutorial = db.define("tutorial", {
  tutName: { type: Sequelize.STRING },
},
{
  timestamps: false
});

module.exports = Tutorial;