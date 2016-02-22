(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('Tmpl', ['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.Tmpl = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var encode = exports.encode = function encode(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\'/g, '&#39;').replace(/\"/g, '&quot;').replace(/\n/g, '<br>');
  };

  var decode = exports.decode = function decode(s) {
    return String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;/g, '\'').replace(/&quot;/g, '"').replace(/<br>/g, '\n');
  };

  var opts = {
    delimiter: '%'
  };

  var set = exports.set = function set(key, val) {
    opts[key] = val;
  };

  var compile = exports.compile = function compile() {
    var tpl = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    var reg = new RegExp('\\<\\' + opts.delimiter + '([\\s\\S]+?)\\' + opts.delimiter + '\\>', 'g');
    var cursor = 0;
    var code = '';
    var match = undefined;

    var push = function push(line, js) {
      if (!line) return push;

      if (js) {
        var _s = line.charAt(0);

        switch (_s) {
          case '=':
            code += '\n            __r__.push(encode(' + line.substr(1) + '));\n          ';
            break;
          case '-':
            code += '\n            __r__.push(' + line.substr(1) + ');\n          ';
            break;
          default:
            code += line;
            break;
        }
      } else {
        code += '\n        __r__.push("' + line.replace(/"/g, '\\"') + '");\n      ';
      }

      return push;
    };

    while (match = reg.exec(tpl)) {
      push(tpl.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
    }

    push(tpl.substr(cursor, tpl.length - cursor));
    code = ('with(obj) {\n            var __r__ = [];\n            ' + code + '\n            return __r__.join("");\n          }').replace(/[\r\t\n]/g, '');

    return function () {
      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      return new Function('obj, encode', code).apply(data, [data, encode]);
    };
  };

  var parse = exports.parse = function parse() {
    var tpl = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    return compile(tpl)(data);
  };
});
