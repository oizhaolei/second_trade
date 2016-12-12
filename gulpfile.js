const gulp = require('gulp');
const less = require('gulp-less');
const path = require('path');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');

gulp.task('default', () => {});

gulp.task('less', () => gulp.src('./less/**/*.less')
  .pipe(less({
    paths: [path.join(__dirname, 'less', 'includes')],
  }))
  .pipe(gulp.dest('./public/stylesheets')));

gulp.task('pre-test', () => gulp.src(['./lib/*.js', './routers/*.js'])
  // Covering files
  .pipe(istanbul())
  // Force `require` to return covered files
  .pipe(istanbul.hookRequire()));

gulp.task('default', ['pre-test'], () => gulp.src(['test/*.js'])
  .pipe(mocha())
  // Creating the reports after tests ran
  .pipe(istanbul.writeReports())
  // Enforce a coverage of at least 90%
  .pipe(istanbul.enforceThresholds({
    thresholds: {
      global: 90,
    },
  })));
