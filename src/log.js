var colors = require('./third_party/colors');
var COLOR_RE = /%([^%]+)%([\s\S]*?)((%[\s\S]*?%)|$)/;

function GHC$$log(options, stream) {
  var text = Array.prototype.slice.call(arguments, typeof stream === 'object' ? 2 : 1).
    join(' ') + '\n';
  stream = typeof stream === 'object' ? stream : process.stdout;

  while (COLOR_RE.test(text)) {
    text = text.replace(COLOR_RE, function(_, name, txt, end) {
      return (options.color ? (txt[name] || txt) : txt) + end;
    });
  }

  stream.write(text);

  return text;
}

GHC$$log.verbose = function(options) {
  if (options.verbose) {
    var text = Array.prototype.slice.call(arguments, 1);
    return GHC$$log.apply(null, [options, process.stdout, '%grey%verbose: '].concat(text));
  }
}

GHC$$log.error = function(options) {
  var text = Array.prototype.slice.call(arguments, 1);
  return GHC$$log.apply(null, [options, process.stderr, '%red%error: '].concat(text));
}

GHC$$log.warning = function(options) {
  var text = Array.prototype.slice.call(arguments, 1);
  return GHC$$log.apply(null, [options, process.stderr, '%yellow%warning: '].concat(text));
}

module.exports = GHC$$log;
