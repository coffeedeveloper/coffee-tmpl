var should = require('should');
var tmpl = require('../build/tmpl');
console.log(tmpl);

var t1 = '<h1><#= title #></h1>';
var maps = [
  { from: '<', to: '&lt;' },
  { from: '>', to: '&gt;' },
  { from: ' ', to: '&nbsp;' },
  { from: '"', to: '&quot;' },
  { from: '\'', to: '&#39;' },
  { from: '&', to: '&amp;' },
];

describe('compile', function() {
  it('compile should be function', function() {
    tmpl.compile(t1).should.be.type('function');
  });

  it('compile return function should can parse template', function() {
    tmpl.compile(t1)({title: 'haha'}).should.be.equal('<h1>haha</h1>');
  });

  it('compile should parse many time', function() {
    var compile = tmpl.compile(t1);
    compile({title: 'haha'}).should.be.equal('<h1>haha</h1>');
    compile({title: 'nimei'}).should.be.equal('<h1>nimei</h1>');
  });
});

describe('parse', function() {
  it('parse should be compile template to string', function() {
    tmpl.parse(t1, {title: 'haha'}).should.be.equal('<h1>haha</h1>');
  });

  it('<#= #> must escape html tag', function() {
    tmpl.parse(t1, {title: '<script>haha</script>'}).should.be
      .equal('<h1>&lt;script&gt;haha&lt;/script&gt;</h1>');
  });

  it('<#= #> must did\' show html tag', function() {
    tmpl.parse(t1, {title: '<script>haha</script>'}).should.not
      .equal('<h1><script>haha</script></h1>');
  });

  it('<#- #> don\'t escape html tag', function() {
    tmpl.parse(t1, {title: '<script>haha</script>'}).should.not
      .equal('<h1><script>haha</script></h1>');
  });

  it('<# #> can be declare variable', function() {
    tmpl.parse('<# var a = 1; #><h1><#= a #></h1>').should.be
      .equal('<h1>1</h1>');
  });
});

describe('delimiter', function() {
  it('change delimiter', function() {
    tmpl.set('delimiter', '%');
    tmpl.parse('<h1><%= title %></h1>', {title: 'haha'}).should.be.equal('<h1>haha</h1>');
  });
});

describe('encode', function() {
  maps.map(function(d) {
    it('encode ' + d.from + ' to ' + d.to, function() {
      tmpl.encode(d.from).should.be.equal(d.to);
    });
  });
});

describe('decode', function() {
  maps.map(function(d) {
    it('decode ' + d.to + ' to ' + d.from, function() {
      tmpl.decode(d.to).should.be.equal(d.from);
    });
  });
});
