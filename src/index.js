/** @module coffee-tmpl */

const tmpl = {};

/**
 * 将字符转换成HTML特殊字符
 * @function
 * @param {string} s - 需要做html encode的字符串
 * @return {string} html encode之后的字符串
 */
tmpl.encode = s => String(s).replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/ /g, '&nbsp;')
                            .replace(/\'/g, '&#39;')
                            .replace(/\"/g, '&quot;')
                            .replace(/\n/g, '<br>');

/**
 * 将HTML特殊字符转回成原字符
 * @function
 * @param {string} s - 需要做html decode的字符串
 * @return {string} html decode之后的字符串
 */
tmpl.decode = s => String(s).replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&#39;/g, '\'')
                            .replace(/&quot;/g, '"')
                            .replace(/<br>/g, '\n');

let opts = {
  delimiter: '%',
};

/**
 * 设置Tmpl的相关项
 * @function
 * @param {string} key - 设置项
 * @param {any} val - 设置内容
 */
tmpl.set = (key, val) => {
  opts[key] = val;
};

/**
 * 生成可执行渲染的函数，用于后期执行模板渲染
 * @function
 * @param {string} tpl - 模板字符串
 * @return {function} 编译后的可执行渲染的函数，主要用于缓存执行，提高效率
 */
tmpl.compile = (tpl = '') => {
  let reg = new RegExp(`\\<\\${opts.delimiter}([\\s\\S]+?)\\${opts.delimiter}\\>`, 'g');
  let cursor = 0;
  let code = '';
  let match;

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

  return (data = {}) => new Function('obj, encode', code).apply(data, [data, encode]);
};

/**
 * 结合数据，渲染HTML字符串
 * @function
 * @param {string} tpl - 模板字符串
 * @param {object} data - 模板的数据源
 * @return {string} 编译后的模板字符串
 */
tmpl.parse = (tpl = '', data = {}) => tmpl.compile(tpl)(data);

export default tmpl;