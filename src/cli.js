require('./polyfill');
var minimist = require('./third_party/minimist');
var pkg = require('./package');
var ghc = require('./index');
var log = require('./log');
var commands = require('./commands');
var Promise = require('./third_party/bluebird');
var _ = require('./third_party/lodash');
var HttpResponse = require('./http').Response;

var opts = {
  boolean: [
    'color',
    'oneline',
    'verbose',
    'version'
  ],
  string: [
    'author',
    'owner',
    'repo',
    'since',
    'until'
  ],
  alias: {
    'oneline': ['1', 'short'],
    'verbose': 'V',
    'version': 'v'
  },
  default: {
    'color': true
  },
  descriptions: {
    'Core': {
      'help': 'Print help message',
      'version': 'Print the application version',
      'verbose': 'Print verbose information',
    },
    'Details': {
      'author': 'Commits authored by the given user or email address',
    },
    'Formatting': {
      'oneline': 'Print short summaries, up to 80 characters, for each record',
    }
  }
};

function GHC_CLI$$version() {
  return [
    pkg.name() + ' v' + pkg.version() + ':',
    '    ' + pkg.description(),
    '    Copyright \u00a92014 ' + pkg.authorName(),
    '    ' + pkg.license() + '-licensed',
    ''
  ].join('\n');
}

function GHC_CLI$$options() {
  var lines = [];

  function lineForDescription(name, descr) {
    var long = '--' + name;
    if (opts.alias[name]) {
      if (typeof opts.alias[name] === 'string') {
        long += ' | ' + (opts.alias[name].length > 1 ? '--' : '-') + opts.alias[name];
      } else {
        opts.alias[name].forEach(function(alias) {
          long += ' | ' + (alias.length > 1 ? '--' : '-') + alias;
        });
      }
    }
    long += ':';
    var line = '      ' + ' '.repeat(25 - long.length) + long + ' '.repeat(5);
    lines.push(line + descr)
  }

  function linesForDescriptions(name) {
    lines.push('  ' + name + ':');
    var collection = opts.descriptions[name];
    if (name === 'Commands') {
      commands.LIST.forEach(function(name) {
        lineForDescription(name, commands[name].description || 'Query for ' + name);
      });      
    } else {
      Object.keys(collection).forEach(function(name) {
        lineForDescription(name, collection[name]);
      });
    }
    lines.push('');
  }
  linesForDescriptions('Core');
  linesForDescriptions('Commands');
  linesForDescriptions('Details');
  linesForDescriptions('Formatting');
  return lines;
}

function GHC_CLI$$help(topic) {
  var help = '';
  if (typeof topic === 'string' && commands[topic] && commands[topic].help) {
    return commands[topic].help();
  } else {
    return [
      GHC_CLI$$version(),
      'Options:',
    ].concat(GHC_CLI$$options()).join('\n');
  }
}

var OWNER_REPO = /^(\S+)\/(\S+)$/;
var OWNER_OR_REPO = /^(\S+)$/;

function GHC_CLI$$main(argv, logOutput) {
  argv = (Array.isArray(argv) && argv) || [];
  var help = argv.indexOf('help');
  if (help < 0) help = argv.indexOf('--help');

  if (help >= 0) {
    var topic = argv[help + 1];
    return Promise.resolve(GHC_CLI$$help(topic) + '\n');
  }

  var unknown;
  var command;
  var owner;
  var repo;
  var badarg;
  var options;
  try {
    options = minimist(argv, _.defaults(opts, {
      unknown: function(arg) {
        var match = /^(--?)?([\s\S]+)$/.exec(arg);
        if (match) {
          var cmd = match[2];
          var iscmd = commands.LIST.indexOf(cmd) >= 0;
          if (!command && iscmd) {
            command = cmd;
          } else if (!match[1]) {
            if (match = OWNER_REPO.exec(arg)) {
              owner = match[1];
              repo = match[2];
            } else if (OWNER_OR_REPO.test(arg)) {
              if (!owner) owner = arg;
              else repo = arg;
            } else {
              throw new Error('Unknown option `' + arg + '`');
            }
          } else if (!iscmd) {
            throw new Error('Unknown option `' + arg + '`');
          }
        }
        return false;
      }
    }));
  } catch (e) {
    return Promise.reject(e);
  }

  if (options.version) {
    return Promise.resolve(GHC_CLI$$version());
  }

  if (!options.owner) options.owner = owner;
  if (!options.repo) options.repo = repo;
  if (command) options.command = command;

  for (var i=0; i<options._.length; ++i) {
    if (options._[i][0] === '-') {
      return Promise.reject(new Error('Unknown option `' + options._[i] + '`'));
    }
  }

  delete options._;
  options.cli = true;

  var p = ghc.run(options);
  if (logOutput === true) {
    p = p.
      then(function(results) {
        if (typeof results === 'string') log(options, results);
        else if (Array.isArray(results)) log(options, results.join('\n'));
        else log(options, JSON.stringify(results, null, 2));
        return results;
      }, function(error) {
        if (error instanceof HttpResponse) {
          log.error(options, error.data.message || ('Error (' + error.status + ')'),
            '\n        ' + error.url + ' (' + error.status + ')');
        } else {
          log.error(options, 'Error: ', error.message || error);
        }
      });
  }
  return p;
}

function GHC_CLI$$CLImain(argv) {
  return GHC_CLI$$main(argv, true).then(function(out) {
    if (typeof out === 'string') {
      log({}, out);
    }
  }, function(e) {
    
  });
}

exports.version = GHC_CLI$$version;
exports.help = GHC_CLI$$help;
exports.main = GHC_CLI$$main;
exports.CLImain = GHC_CLI$$CLImain;
