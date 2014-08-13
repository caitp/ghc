var moment = require('moment');

function GHC$$calendar$$short(date) {
  date = moment(date);
  return date.format('YYYY/MM/DD');
}

exports.short = GHC$$calendar$$short;
