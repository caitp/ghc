var path = require('path');
var fs = require('fs');

var COMMAND_SRC = /^(\w+)\.js$/;

exports.LIST = [];

fs.readdirSync(path.resolve(__dirname)).forEach(function(file) {
  var match;
  if (match = COMMAND_SRC.exec(file)) {
    var name = path.resolve(__dirname, file);
    if (name !== __filename && fs.statSync(name).isFile()) {
      exports[match[1]] = require(name);
      exports.LIST.push(match[1]);
    }
  }
});
