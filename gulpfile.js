var gulp = require('gulp'),
    gutil = require('gulp-util'),
    bower = require('bower'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    // jquery = require('gulp-jquery'),
    // compass = require('gulp-compass'),
    // gulpif = require('gulp-if'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    sh = require('shelljs'),
    env;


env = process.env.NODE_ENV || 'development';

var sourcePaths = {
  sass: ['scss/**/*.scss'],
  stylus: ['www/_dev/stylus/*.styl'],
  coffee: ['www/_dev/coffee/*.coffee'],
  html: ['*.html', '**/*.html'],
  js: ['www/_dev/js/*.js'],
  jade: ['*.jade']
};

gulp.task('sass', function(done) {
  gulp.src('scss/ionic.app.scss')
    .pipe(gulp.dest('www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('www/css/'))
    .on('end', done);
});

// gulp.task('compass', function() {
//   gulp.src(sourcePaths.sass)
//     .pipe(compass({
//       sass: 'path/to/sass',
//       image: 'path/to/images',
//       style: 'expanded'
//     }))
//     .on('error', gutil.log)
//     .pipe(gulp.dest('www/css/'));
// });

gulp.task('coffee', function() {
  gulp.src(sourcePaths.coffee)
    .pipe(coffee({bare: true})
      .on('error', gutil.log))
    .pipe(gulp.dest('www/_dev/js/'))
    ;
});

gulp.task('js', function() {
  gulp.src(sourcePaths.js)
    .pipe(concat('app.js'))
    // .pipe(browserify())
    // .pipe(gulpif(env === 'production', uglify()))
    // .pipe(uglify())
    .pipe(gulp.dest('www/js/'))
    ;
});

gulp.task('stylus', function() {
  gulp.src(sourcePaths.stylus)
    .pipe(stylus({errors: true}))
    .pipe(gulp.dest('www/css/'))
    ;
});

gulp.task('jade', function() {
  var YOUR_LOCALS = {};

  gulp.src(sourcePaths.jade)
    .pipe(jade({
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('www/templates/'))
});

gulp.task('default', ['sass', 'stylus', 'coffee', 'js', 'jade', 'watch']);

gulp.task('watch', function() {
  // Second: task name 'sass, js, ...'
  var server = livereload();
  gulp.watch(sourcePaths.sass, ['sass']);
  gulp.watch(sourcePaths.sass, ['stylus']);
  gulp.watch(sourcePaths.coffee, ['coffee']);
  gulp.watch(sourcePaths.js, ['js']);
  gulp.watch(sourcePaths.html, function(e){
    server.changed(e.path);
  });
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});