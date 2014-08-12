var path = require('path');
var fs = require('fs');

var fileName = path.resolve(__dirname, '..', 'package.json');
var pkg;

try {
  pkg = JSON.parse(fs.readFileSync(fileName, {
    encoding: 'utf8',
    flag: 'r'
  }));
} catch (e) {
  // TODO(@caitp): only log if debugging or in a verbose mode
  console.log(e.message || e);
  pkg = {};
}

exports.version = function GHC_package$$version() {
  return pkg.version || '???';
};

exports.description = function GHC_package$$description() {
  return pkg.description || 'A shell client for communicating with the GitHub API';
};

exports.license = function GHC_package$$license() {
  return pkg.license || 'MIT';
};

exports.author = function GHC_package$$author() {
  return pkg.author || 'Caitlin Potter';
};

exports.authorName = function GHC_package$$authorName() {
  return exports.author().replace(/(\s*\<.*)$/, '');
};

exports.name = function GHC_package$$name() {
  return pkg.name || 'ghc';  
};
