const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const Question = db.define("qn", {
  qnOrder: { type: Sequelize.STRING },
  question: { type: Sequelize.STRING },
  correctAns: { type: Sequelize.STRING },
});

module.exports = Question;
