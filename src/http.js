var Promise = require('./third_party/bluebird');
var _http = require('http');
var _https;
try { _https = require('https'); } catch (e) {};
var url = require('url');
var log = require('./log');
var moment = require('./third_party/moment');

var ARRAY_BRACKET_REGEXP = /\[\]$/;
var INT_REGEXP = /^\d+$/;

function HttpResponse(url, res) {
  this.status = res.statusCode;
  this.headers = res.headers;
  this.url = url;
  this.data = '';
};

function buildURLParams(key, value, add) {
  var i, ii, name, v, classicArray = false;
  if (Array.isArray(value)) {
    classicArray = key.test(ARRAY_BRACKET_REGEXP);
    for (i=0, ii=value.length; i<ii; ++i) {
      v = value[i];
      if (classicArray) {
        add(key, v);
      } else {
        buildURLParams(key + '[' + (typeof v === 'object' ? i : '') + ']', v, add);
      }
    }
  } else if (typeof value === 'object') {
    Object.keys(value).forEach(function(name) {
      buildURLParams(key + '[' + name + ']', value[name], add);
    });
  } else {
    add(key, value);
  }
}

// Based on jQuery.param (2.x.x)
function serializeURLParams(params) {
  var key, s;
  function add(key, value) {
    value = typeof value === 'function' ? value() : value == null ? '' : value;
    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }

  if (typeof params === 'object') {
    s = [];
    for (key in params) {
      if (params.hasOwnProperty(key)) {
        buildURLParams(key, params[key], add);
      }
    }
  }

  return s.join('&').replace(/%20/, '+');
}

var FILTER_KEYS = {
  'author': true
};

var FILTER_TYPES = {
  'author': 'string'
};

function params(options) {
  var params;
  var key;
  var value;
  var result = '';
  if (!options || typeof options !== "object") {
    return '';
  }

  params = {};

  Object.keys(options).forEach(function(key) {
    value = FILTER_KEYS[key];
    if (value === true) {
      params[key] = options[key];
    } else if (typeof value === 'string') {
      params[value] = options[key];
    }
  });

  Object.keys(params).forEach(function(key) {
    value = params[key];
    var type = FILTER_TYPES[key];

    if (typeof value === 'function') {
      value = value();
    }

    switch (type) {
      case 'date':
        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'object') {
          value = moment(value);
          if (value.isValid()) {
            // TODO(@caitp): does GitHub like dates formatted this way?
            params[key] = value.format();
            break;
          }
        }
        delete params[key];
        break;
      case 'int':
        if ((typeof value === 'string' && INT_REGEXP.test(value)) || typeof value === 'number') {
          value = Number(value);
          if (value === value && Math.abs(value) !== Infinity) {
            params[key] = value | 0; // cast to int
            break;
          }
        }
        delete params[key];
        break;
      case 'string':
        if (typeof params[key] !== 'string') {
          delete params[key];
        }
        break;
      default:
        delete params[key];
    }
  });

  result = serializeURLParams(params);
  return result ? '?' + result : '';
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

  return formatUrl('%@/%@%@', options.baseUrl, parts.join('/'), params(options));
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

    log.verbose(options, 'Requesting:%green%', origUrl);

    url.method = request.method || 'get';

    url.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ghc'
    };

    var http = (url.protocol === 'https' ? _http : _https);
    http.request(url, function(res) {
      res.setEncoding('utf8');
      var response = new HttpResponse(origUrl, res);

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
GHC$$httpRequest.Response = HttpResponse;
module.exports = GHC$$httpRequest;
