const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const Result = db.define("result", {
  status: { type: Sequelize.STRING },
  score: { type: Sequelize.INTEGER },
});

module.exports = Result;
