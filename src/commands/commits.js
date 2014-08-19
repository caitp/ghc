var http = require('../http');
var log = require('../log');
var calendar = require('../calendar');
var trim = require('../trim');
var pad = require('../pad');

function fullName(login, extra) {
  var name = (extra && extra.name) || '';
  var email = (extra && extra.email) || '';
  var result = login || '';

  if (name && name !== login) {
    result += (' (' + name + ')');
  }
  if (email) {
    result += ' <' + email + '>';
  }
  return result;
}

function GHC$$commits$$oneline(commit) {
  var c = commit.commit;
  var author = pad.left((commit.author && commit.author.login) || '', 19) + ' ';
  var msg = pad.right(trim(c && c.message), 85);
  var date = pad.right(calendar.short(c.committer.date), 15);
  var sha = pad.right((commit.sha || '').substr(0, 8), 10);

  return sha + author + msg + date;
}

function GHC$$commits$$details(commit) {
  // Roughly the equivalent of git log --pretty=medium --- todo support more format modes
  var c = commit.commit;
  var sha = commit.sha || '';
  var author = fullName(commit.author.login, c.author) || '?';
  var committer = fullName(commit.committer.login, c.committer) || '?';
  var adate = calendar.shortWithTime(commit.author.date) || '?';
  var cdate = calendar.shortWithTime(commit.committer.date) || '?';
  var message = c.message || '';

  return [
    'Commit: ' + sha,
    'Author: ' + author,
    'Committer: ' + committer,
    'Authored: ' + adate,
    'Checked in: ' + cdate,
    '',
    message,
    '',
  ].join('\n');
}

function GHC$$commits(options) {
  log.verbose(options, '%yellow%fetching commits for ' + options.owner + '/' + options.repo);
  return http(options, {
    command: 'commits'
  }).
  then(function(res) {
    if (options.cli) {
      return res.data.map(options.oneline ? GHC$$commits$$oneline : GHC$$commits$$details);
    } else {
      return res.data;
    }
  });
}

GHC$$commits.description = 'Query for commits in a repository';

module.exports = GHC$$commits;
