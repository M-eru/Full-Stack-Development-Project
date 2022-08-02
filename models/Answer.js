const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const Answer = db.define("answer", {
  ans: { type: Sequelize.STRING },
  input: { type: Sequelize.STRING },
});

module.exports = Answer;