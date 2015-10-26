var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');

gulp.task('webpack', function() {
  webpack({
    entry: './lib/tmpl.js',
    output: {
      path: './build/js',
      filename: 'tmpl.js',
    },
    module: {
      loaders: [
        { test: /\.(js|jsx)$/, loader: 'babel-loader'},
      ],
    },
    devtool: 'source-map',
    watch: true,
  }, function(err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({}));
  });
});

gulp.task('default', ['webpack']);
