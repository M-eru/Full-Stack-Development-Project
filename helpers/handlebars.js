const moment = require('moment');

const formatDate = function (date, targetFormat) {
    return moment(date).format(targetFormat);
};

const replaceCommas = function(value) {
    return value ? value.replace(/,/g, ' | ') : 'None';
}

const radioCheck = function (value, radioValue) {
    return (value == radioValue) ? 'checked' : '';
};

module.exports = { formatDate, replaceCommas, radioCheck };