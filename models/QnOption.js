const Sequelize = require("sequelize");
const db = require("../config/DBConfig");

const QnOption = db.define("qnOption", {
  ans1: { type: Sequelize.STRING },
  ans2: { type: Sequelize.STRING },
  ans3: { type: Sequelize.STRING },
  ans4: { type: Sequelize.STRING },
});

module.exports = QnOption;
