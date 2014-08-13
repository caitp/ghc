var Promise = require('bluebird');
var _http = require('http');
var _https;
try { _https = require('https'); } catch (e) {};
var url = require('url');
var log = require('./log');

function params(options, request) {
  return '';
}

function formatUrl(template, args) {
  var i = 0;
  var ii;
  args = Array.prototype.slice.call(arguments, 1);
  ii = args.length;

  return template.replace(/\%\@/g, function() {
    if (i < ii) {
      var str = args[i++];
      if (typeof str === 'undefined') return '';
      return ('' + str).
        replace(/^\/+/, '').
        replace(/\/+$/, '');
    }
    return '';
  });
}

function buildUrl(options, request) {
  var parts = [];
  var owner = request.owner || options.owner;
  var repo = request.repo || options.repo;

  if (typeof owner === 'string') {
    parts.push(owner);
    if (typeof repo === 'string') {
      parts.unshift('repos');
      parts.push(repo);
    } else {
      parts.unshift('users');
    }
  }
  if (typeof request.command === 'string') {
    parts.push(request.command);
  }
  return formatUrl('%@/%@%@', options.baseUrl, parts.join('/'), params(options, request));
}

function tryParseJSON(data) {
  if (data) {
    if (typeof data !== 'string') {
      data = data.toString();
    }
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
  }
  return null;
}

function GHC$$httpRequest(options, request) {
  return new Promise(function(resolve, reject) {
    var origUrl;
    var url = require('url').parse(origUrl = buildUrl(options, request));

    url.method = request.method || 'get';

    url.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ghc'
    };

    var http = (url.protocol === 'https' ? _http : _https);
    http.request(url, function(res) {
      res.setEncoding('utf8');
      var response = {
        status: res.statusCode,
        headers: res.headers,
        data: ''
      };

      res.on('data', function(data) {
        response.data += data;
      });

      res.on('end', function() {
        response.data = tryParseJSON(response.data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    }).on('error', function(e) {
      reject(e);
    }).end();
  });
}

GHC$$httpRequest.url = buildUrl;

module.exports = GHC$$httpRequest;
