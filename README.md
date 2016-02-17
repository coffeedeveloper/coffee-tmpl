# coffee-tmpl

一个极简的JS模板引擎，**无任何依赖**，源文件大小仅**1.6kb**，语法类似`ejs`。

- `<% var a = 1; %>` js语句，支持变量申明和`for`循环等等语句。
- `<%= a %>` 输出变量内容（HTML编码）
- `<%- a %>` 原样输出，不编码

### 接口说明

#### compile(tpl)

返回一个预编译好的可执行模板函数。

- tpl: 为模板字符串

```javascript
var tpl = '<h1><%= title %></h1>';
var fuc = tmpl.compile(tpl);

fuc({title: 'haha'}); //<h1>haha</h1>
```

#### parse(tpl, data)

返回编译后的模板字符串

- tpl: 模板字符串
- data: 模板数据

```javascript
var tpl = '<h1><%= title %></h1>';
tmpl.parse(tpl, {title: 'haha'});//<h1>haha</h1>
```

#### set(key, val)

修改tmpl的配置项

- key: 设置项
- val: 设置内容

目前只有设置分隔符一个选项，例如当你在`node`环境下采用`ejs`做你的模板引擎，你想在页面上继续用`tmpl`可以设置`tmpl`的`delimier`。

```javascript
tmpl.set('delimiter', '#');
var tpl = '<h1><#= title #></h1>';
tmpl.parse(tpl, {title: 'haha'});//<h1>haha</h1>
```
