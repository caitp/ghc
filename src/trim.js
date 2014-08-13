var EOL_RE = /[\r\n]/m;

function GHC$$trim(str) {
  str = '' + str;
  var match = str.match(EOL_RE);
  return match ? str.substr(0, match.index) : str;
}

module.exports = GHC$$trim;
