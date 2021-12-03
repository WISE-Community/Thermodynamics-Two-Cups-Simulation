var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var tsify = require('tsify');
var gutil = require('gulp-util');
var paths = {
  files: ['src/*.html', 'src/css/*', 'src/images/**/*'],
};

var watchedBrowserify = watchify(
  browserify({
    basedir: '.',
    debug: true,
    entries: ['src/main.ts'],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

gulp.task('copy-files', function () {
  return gulp.src(paths.files, { base: './src/' }).pipe(gulp.dest('dist'));
});

gulp.task('copy-changes', function () {
  var watcher = gulp.watch(paths.files, function (done) {
    done();
  });
  watcher.on('change', function (path) {
    gulp.src(path, { base: './src/' }).pipe(gulp.dest('./dist'));
    bundle();
  });
  watcher.on('add', function (path) {
    gulp.src(path, { base: './src/' }).pipe(gulp.dest('./dist'));
    bundle();
  });
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on('error', function (err) {
      console.log(err.message);
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
}

gulp.task('bundle', bundle);
gulp.task('default', gulp.parallel('copy-files', 'copy-changes', 'bundle'));

watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', gutil.log);
