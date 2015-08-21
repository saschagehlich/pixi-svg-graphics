var path = require('path')
var gulp = require('gulp')
var webpack = require('gulp-webpack')
var source = require('vinyl-source-stream')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')

gulp.task('webpack', function () {
  var sourceFiles = path.resolve(__dirname, 'src')
  var input = path.resolve(sourceFiles, 'pixi-svg-graphics.js')

  return gulp.src(input)
    .pipe(webpack({
      context: sourceFiles,
      output: {
        library: 'SVGGraphics',
        libraryTarget: 'umd',
        filename: 'pixi-svg-graphics.js',
        path: path.resolve(__dirname, 'dist')
      },
      resolve: {
        extensions: ['', '.js'],
        root: sourceFiles
      },
      externals: {
        'PIXI': {
          root: 'PIXI',
          commonjs: 'pixi.js',
          commonjs2: 'pixi.js',
          amd: 'pixi.js'
        }
      }
    }))
    .pipe(gulp.dest(path.resolve(__dirname, 'dist')))
})

gulp.task('uglify', function () {
  var input = path.resolve(__dirname, 'dist/pixi-svg-graphics.js')
  return gulp.src(input)
    .pipe(uglify())
    .pipe(rename({
       extname: '.min.js'
     }))
    .pipe(gulp.dest(path.resolve(__dirname, 'dist')))
})

gulp.task('default', ['webpack', 'uglify'])
