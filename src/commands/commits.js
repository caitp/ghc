var http = require('../http');
var log = require('../log');
var calendar = require('../calendar');
var trim = require('../trim');
var pad = require('../pad');

function GHC$$commits$$oneline(commit) {
  var c = commit.commit;
  var author = pad.left((commit.author && commit.author.login) || '', 19) + ' ';
  var msg = pad.right(trim(c && c.message), 85);
  var date = pad.right(calendar.short(c && c.date), 15);
  var sha = pad.right((commit.sha || '').substr(0, 8), 10);

  return sha + author + msg + date;
}

function GHC$$commit$$details(commit) {
  
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
  }).
  catch(function(err) {
    if (err instanceof Error) throw err;
  });
}

GHC$$commits.description = 'Query for commits in a repository';

module.exports = GHC$$commits;
