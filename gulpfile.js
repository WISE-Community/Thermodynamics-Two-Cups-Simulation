var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var tsify = require('tsify');
var gutil = require('gulp-util');
var paths = {
  files: [
    'src/*.html',
    'src/css/*',
    'src/images/**/*'
  ]
};

var watchedBrowserify = watchify(browserify({
  basedir: '.',
  debug: true,
  entries: [
    'src/main.ts'
  ],
  cache: {},
  packageCache: {}
}).plugin(tsify));

gulp.task("copy-files", function() {
  return gulp.src(paths.files, { 'base': './src/'})
    .pipe(gulp.dest("dist"));
});

gulp.task('copy-changes', function() {
  return gulp.watch(paths.files, function(obj) {
    if ( obj.type === 'changed' || obj.type === 'added' ) {
      console.log('copying changed file: ' + obj.path + ' to dist folder');
      gulp.src( obj.path, { 'base': './src/'})
      .pipe(gulp.dest('./dist'));
    }
  })
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on('error', function(err) {
      //console.log(err.message);
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
}

gulp.task('default', ['copy-files', 'copy-changes'], bundle);
watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', gutil.log);
