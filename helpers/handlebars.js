const moment = require("moment");

const formatDate = function (date, targetFormat) {
  return moment(date).format(targetFormat);
};

const replaceCommas = function (value) {
  return value ? value.replace(/,/g, " | ") : "None";
};

const radioCheck = function (value, radioValue) {
  return value == radioValue ? "checked" : "";
};

const capString = function (string) {
  return string[0].toUpperCase() + string.substring(1)
};

const when = function (operand_1, operator, operand_2, options) {
  var operators = {
      eq: function (l, r) {
        return l == r;
      },
      noteq: function (l, r) {
        return l != r;
      },
      gt: function (l, r) {
        return Number(l) > Number(r);
      },
      or: function (l, r) {
        return l || r;
      },
      and: function (l, r) {
        return l && r;
      },
      "%": function (l, r) {
        return l % r === 0;
      },
    },
    result = operators[operator](operand_1, operand_2);

  if (result) return options.fn(this);
  else return options.inverse(this);
};

module.exports = { formatDate, replaceCommas, radioCheck, when, capString };
