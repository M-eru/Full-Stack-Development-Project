const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const Question = db.define("qn", {
  qnOrder: { type: Sequelize.INTEGER },
  question: { type: Sequelize.STRING },
  correctAns: { type: Sequelize.STRING },
},
{
  timestamps: false
});

module.exports = Question;
