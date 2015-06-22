var path = require('path')
var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')

gulp.task('default', function () {
  var b = browserify({
    entries: './src/pixi-svg-graphics',
  })

  return b.bundle()
    .pipe(source('pixi-svg-graphics.js'))
    .pipe(gulp.dest('dist'))
});
