var moment = require('./third_party/moment');

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

function GHC$$calendar$$now() {
  return moment().local().toISOString();
}

function GHC$$calendar$$today() {
  return moment().hours(0).minutes(0).seconds(0).local().toISOString();
}

function GHC$$calendar$$yesterday() {
  return moment().hours(0).minutes(0).seconds(0).day(moment().day()-1).local().
    toISOString();
}

function GHC$$calendar$$lastWeek() {
  return moment().hours(0).minutes(0).seconds(0).day(-6).local().toISOString();
}

function GHC$$calendar$$lastMonth() {
  return moment().hours(0).minutes(0).seconds(0).month(moment.month()-1).day(0).local().
    toISOString();  
}

function GHC$$calendar$$lastYear() {
  return moment().hours(0).minutes(0).seconds(0).year(moment().year()-1).dayOfYear(1).local().
      toISOString();
}

exports.short = GHC$$calendar$$short;
exports.shortWithTime = GHC$$calendar$$shortWithTime;
exports.now = GHC$$calendar$$now;
exports.today = GHC$$calendar$$today;
exports.yesterday = GHC$$calendar$$yesterday;
exports.lastWeek = GHC$$calendar$$lastWeek;
exports.lastMonth = GHC$$calendar$$lastMonth;
exports.lastYear = GHC$$calendar$$lastYear;
