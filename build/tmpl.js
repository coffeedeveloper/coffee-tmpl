(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.tmpl = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var global = window;

  var support = {
    localStorage: 'localStorage' in global
  };

  var getCache = function getCache(name, version) {
    var result = {
      name: name,
      version: version,
      code: ''
    };

    try {
      var str = global.localStorage.getItem(name);
      if (str) {
        var obj = JSON.parse(str);
        if (obj.version === version) result = obj;
      }
    } catch (err) {
      console.error(err);
    }

    return result;
  };

  var setCache = function setCache(opts) {
    try {
      global.localStorage.setItem(opts.name, JSON.stringify(opts));
    } catch (err) {
      console.error(err);
    }
  };

  var encode = function encode(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\'/g, '&#39;').replace(/\"/g, '&quot;').replace(/\n/g, '<br>');
  };

  var decode = function decode(s) {
    return String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;/g, '\'').replace(/&quot;/g, '"').replace(/<br>/g, '\n');
  };

  var defaultParseOpts = { cache: true, name: '', version: '0' };

  var parse = function parse() {
    var tpl = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var opts = arguments.length <= 2 || arguments[2] === undefined ? defaultParseOpts : arguments[2];

    var reg = /\<\#([\s\S]+?)\#\>/g,
        code = '',
        cursor = 0,
        result = undefined,
        match = undefined,
        cacheCode = '',
        cacheObj = {};

    var isCache = support.localStorage && opts.cache && opts.name;

    if (isCache) {
      cacheObj = getCache(opts.name, opts.version);
      if (cacheObj.code) cacheCode = cacheObj.code;
    }

    if (!cacheCode) {
      (function () {
        var push = function push(line, js) {
          if (!line) return push;
          if (js) {
            var _s = line.charAt(0);

            switch (_s) {
              case '=':
                code += '\n              __r__.push(encode(' + line.substr(1) + '));\n            ';
                break;
              case '-':
                code += '\n              __r__.push(' + line.substr(1) + ');\n            ';
                break;
              default:
                code += line;
                break;
            }
          } else {
            code += '\n          __r__.push("' + line.replace(/"/g, '\\"') + '");\n        ';
          }

          return push;
        };

        while (match = reg.exec(tpl)) {
          push(tpl.slice(cursor, match.index))(match[1], true);
          cursor = match.index + match[0].length;
        }

        push(tpl.substr(cursor, tpl.length - cursor));
        code = ('with(obj) {\n              var __r__ = [];\n              ' + code + '\n              return __r__.join("");\n            }').replace(/[\r\t\n]/g, '');

        if (isCache) setCache({ name: opts.name, version: opts.version, code: code });
      })();
    } else {
      code = cacheCode;
    }

    try {
      result = new Function('obj', 'encode', code).apply(data, [data, encode]);
    } catch (e) {
      console.error('\'' + e.message + '\'', 'in \n\n Code: \n', code, '\n');
    }

    return result;
  };

  module.exports = {
    parse: parse,
    decode: decode,
    encode: encode
  };
});

//# sourceMappingURL=tmpl.js.map