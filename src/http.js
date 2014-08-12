var Promise = require('bluebird');
var http = require('http');
var url = require('url');

function params(options, request) {
  return '';
}

function buildUrl(options, request) {
  var parts = [];
  var owner = request.owner || options.owner;
  var repo = request.repo || options.repo;

  if (typeof owner === 'string') {
    parts.push(owner);
    if (typeof repo === 'string') {
      parts.push(repo);
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
    var url = url.parse(buildUrl(options, request));

    url.method = request.method || 'get';

    url.headers = {
      'Accept': 'application/vnd.github.v3+json'
    };

    http.request(url, function(res) {
      var response = {
        status: res.statusCode,
        headers: res.headers,
        data: tryParseJSON(res.read())
      };
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(response);
      } else {
        reject(response);
      }
    }).on('error', function(e) {
      reject(e);
    }).end();
  });
}

GHC$$httpRequest.url = buildUrl;

module.exports = GHC$$httpRequest;
