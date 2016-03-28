var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var sass        = require("gulp-ruby-sass");

var browserSync = require('browser-sync').create();


function compile(watch) {
  var bundler = watchify(browserify('./src/index.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('sass', function () {

    return sass('sass/**/*.scss', { style: 'expanded' })
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(gulp.dest('./build/css'))
        .pipe(sourcemaps.write('./build/css', {
            includeContent: false,
            sourceRoot: './sass'
        }))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('serve', ['sass', 'watch'], function() {
  browserSync.init({
    server: {
      baseDir: "./build",
    },
    startPath: "/index.html"
    });
  gulp.watch('./build/*.js', ['build'], browserSync.reload);
  gulp.watch("sass/**/*.scss", ['sass']);
  gulp.watch("build/*.html").on('change', browserSync.reload);
});


gulp.task('default', ['watch']);
