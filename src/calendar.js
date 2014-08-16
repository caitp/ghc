var moment = require('moment');

// The GitHub API appears to serve dates in the timezone of the requester, so there should be
// little reason to manipulate these further. However, they do provide timezone information should
// the need arise in the future.
function GHC$$calendar$$short(date) {
  date = moment(date);
  return date.local().format('YYYY/MM/DD');
}

// TODO(@caitp): switch between 12hour/24hour displays based on preferences.
function GHC$$calendar$$shortWithTime(date) {
  date = moment(date);
  return date.local().format('YYYY/MM/DD hh:mm a');
}

exports.short = GHC$$calendar$$short;
exports.shortWithTime = GHC$$calendar$$shortWithTime;
