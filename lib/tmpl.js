const global = window;

const support = {
  localStorage: 'localStorage' in global,
};

const getCache = (name, version) => {
  let result = {
    name: name,
    version: version,
    code: '',
  };

  try {
    const str = global.localStorage.getItem(name);
    if (str) {
      let obj = JSON.parse(str);
      if (obj.version === version) result = obj;
    }
  } catch (err) {
    console.error(err);
  }

  return result;
};

const setCache = opts => {
  try {
    global.localStorage.setItem(opts.name, JSON.stringify(opts));
  } catch (err) {
    console.error(err);
  }
};

const encode = s => String(s).replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/ /g, '&nbsp;')
                              .replace(/\'/g, '&#39;')
                              .replace(/\"/g, '&quot;')
                              .replace(/\n/g, '<br>');

const decode = s => String(s).replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&nbsp;/g, ' ')
                              .replace(/&#39;/g, '\'')
                              .replace(/&quot;/g, '"')
                              .replace(/<br>/g, '\n');

const defaultParseOpts = { cache: true, name: '', version: '0', };

const parse = (tpl = '', data = {}, opts = defaultParseOpts) => {
  let reg = /\<\#([\s\S]+?)\#\>/g,
      code = '',
      cursor = 0,
      result,
      match,
      cacheCode = '',
      cacheObj = {};

  const isCache = support.localStorage && opts.cache && opts.name;

  if (isCache) {
    cacheObj = getCache(opts.name, opts.version);
    if (cacheObj.code) cacheCode = cacheObj.code;
  }

  if (!cacheCode) {
    const push = (line, js) => {
      if (!line) return push;
      if (js) {
        let _s = line.charAt(0);

        switch (_s) {
          case '=':
            code += `
              __r__.push(encode(${line.substr(1)}));
            `;
            break;
          case '-':
            code += `
              __r__.push(${line.substr(1)});
            `;
            break;
          default:
            code += line;
            break;
        }
      } else {
        code += `
          __r__.push("${line.replace(/"/g, '\\"')}");
        `;
      }

      return push;
    };

    while (match = reg.exec(tpl)) {
      push(tpl.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
    }

    push(tpl.substr(cursor, tpl.length - cursor));
    code = (`with(obj) {
              var __r__ = [];
              ${code}
              return __r__.join("");
            }`).replace(/[\r\t\n]/g, '');

    if (isCache)
      setCache({ name: opts.name, version: opts.version, code: code, });
  } else {
    code = cacheCode;
  }

  try {
    result = new Function('obj, encode', code).apply(data, [data, encode]);
  } catch (e) {
    console.error(`
      ${e.message}
      in Code:
      ${code}
    `);
  }

  return result;
};

export default {
  parse,
  decode,
  encode,
};
