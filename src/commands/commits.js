var http = require('../http');

function GHC$$commits(options) {
  http(options, {
    command: 'commits'
  }).
  then(function(res) {
    
  }).
  catch(function(err) {
    if (err instanceof Error) throw err;
  });
}

GHC$$commits.description = 'Query for commits in a repository';

module.exports = GHC$$commits;
