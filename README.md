# coffee-tmpl

一个极简的JS模板引擎，语法类似`ejs`。

- `<# var a = 1; #>` js语句，支持变量申明和`for`循环等等语句。
- `<#= a #>` 输出变量内容（HTML编码）
- `<#- a #>` 原样输出，不编码

### 接口说明

##### compile(tpl)
返回一个预编译好的可执行模板函数。
tpl: 为模板字符串

```javascript
var tpl = '<h1><#= title #></h1>';
var fuc = tmpl.compile(tpl);

fuc({title: 'haha'}); //<h1>haha</h1>
```

##### parse(tpl, data)
返回编译后的模板字符串
tpl: 模板字符串
data: 模板数据

```javascript
var tpl = '<h1><#= title #></h1>';
tmpl.parse(tpl, {title: 'haha'});//<h1>haha</h1>
```
