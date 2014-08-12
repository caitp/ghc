var minimist = require('minimist');
var pkg = require('./package');
var ghc = require('./index');
var commands = require('./commands');
var Promise = require('bluebird');
var _ = require('lodash');

var opts = {
  boolean: [
    'oneline',
    'verbose',
    'version'
  ],
  string: [
    'author'
  ],
  alias: {
    'oneline': ['1', 'short'],
    'verbose': 'V',
    'version': 'v'
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

  function repeat(str, count) {
    if (str.repeat) return str.repeat(count);
    var result = '';
    while (count-- > 0) result += str;
    return result;
  }

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
    var line = '      ' + repeat(' ', 25 - long.length) + long + repeat(' ', 5);
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

function GHC_CLI$$main(argv) {
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
  var options = minimist(argv, _.defaults(opts, {
    unknown: function(arg) {
      var match = /^(--)?([\s\S]+)$/.exec(arg);
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
    }
  });

  if (options.version) {
    return Promise.resolve(GHC_CLI$$version());
  }

  var command = options.command || '';
  commands.LIST.forEach(function(name) {
    var i;
    if ((i = options._.indexOf(name)) >= 0) {
      options[name] = true;
      options._.splice(i, 1);
    }
    if (options[name] && !command) command = name;
    delete options[name];
  });

  if (command) {
    options.command = command;
  }

  for (var i=0; i<options._.length; ++i) {
    var opt = options._[i];
    var match;
    if (match = OWNER_REPO.exec(opt)) {
      options.owner = match[1];
      options.repo = match[2];
    } else if (match = OWNER_OR_REPO.exec(opt)) {
      if (options.owner) options.repo = match[1];
      else options.owner = match[1];
    }
  }

  for (var i=0; i<options._.length; ++i) {
    if (options._[i][0] === '-') {
      return Promise.reject(new Error('Unknown option `' + options._[i] + '`'));
    }
  }

  delete options._;

  return ghc.run(options);
}

function GHC_CLI$$CLImain(argv) {
  return GHC_CLI$$main(argv).
    then(function(data) {
      if (data) {
        process.stdout.write('' + data + '\n');
      }
      process.exit(0);
    }, function(error) {
      process.stderr.write((error.message || error) + '\n');
      process.exit(1);
    });
}

exports.version = GHC_CLI$$version;
exports.help = GHC_CLI$$help;
exports.main = GHC_CLI$$main;
exports.CLImain = GHC_CLI$$CLImain;
