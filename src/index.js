require('./polyfill');
var Promise = require('./third_party/bluebird');
var commands = require('./commands');
var _ = require('./third_party/lodash');
var log = require('./log');

function GHC$$run(options) {
  options = _.defaults(options || {}, {
    baseUrl: 'https://api.github.com'
  });

  if (!options.command) {
    return Promise.resolve('Missing command');
  } else if (!commands.LIST.indexOf(options.command) < 0) {
    return Promise.reject(new Error('Unknown command `' + options.command + '`.'));
  }

  return Promise.resolve(commands[options.command](options));
}

commands.LIST.forEach(function(name) {
  exports[name] = commands[name];
});

exports.run = GHC$$run;
