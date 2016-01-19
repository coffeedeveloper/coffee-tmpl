/** @module coffee-tmpl */

/**
 * @param {string} s - 需要做html encode的字符串
 * @return {string} html encode之后的字符串
 */
export const encode = s => String(s).replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/ /g, '&nbsp;')
                              .replace(/\'/g, '&#39;')
                              .replace(/\"/g, '&quot;')
                              .replace(/\n/g, '<br>');


/**
 * @param {string} s - 需要做html decode的字符串
 * @return {string} html decode之后的字符串
 */
export const decode = s => String(s).replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&nbsp;/g, ' ')
                              .replace(/&#39;/g, '\'')
                              .replace(/&quot;/g, '"')
                              .replace(/<br>/g, '\n');

/**
 * @param {string} tpl - 模板字符串
 * @return {function} 编译后的可执行渲染的函数，主要用于缓存执行，提高效率
 */
export const compile = (tpl = '') => {
  let reg = /\<\#([\s\S]+?)\#\>/g;
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

  return data => new Function('obj, encode', code).apply(data, [data, encode]);
};

/**
 * @param {string} tpl - 模板字符串
 * @param {object} data - 模板的数据源
 * @return {string} 编译后的模板字符串
 */
export const parse = (tpl = '', data = {}) => compile(tpl)(data);
