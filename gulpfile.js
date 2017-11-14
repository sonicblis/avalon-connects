const gulp = require('gulp');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const flatten = require('gulp-flatten');
const browser = require('browser-sync');

gulp.task('libs', () => {
  gulp.src([
    './node_modules/angular/angular.min.js',
    './node_modules/firebase/firebase.js',
    './node_modules/angularfire/dist/angularfire.min.js',
  ]).pipe(concat('libs.js'))
    .pipe(gulp.dest('./dist'));
});
gulp.task('index', () => {
  gulp.watch('index.html', { ignoreInitial: false }, function () {
    gulp.src('index.html')
      .pipe(gulp.dest('./dist'));
  });
});
gulp.task('views', () => {
  gulp.src('./app/**/*.html')
    .pipe(flatten())
    .pipe(gulp.dest('./dist/views'));
});
gulp.task('concat', () => {
  gulp.src('./app/**/*.js')
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(concat('dist.js'))
    .pipe(gulp.dest('./dist'));
});
gulp.task('sass', () => {
  gulp.src('./app/**/*.scss')
    .pipe(sass())
    .pipe(concat('dist.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch-html', () => {
  gulp.watch('./app/**/*.html', { ignoreInitial: false }, ['views']);
});
gulp.task('watch-js', () => {
  gulp.watch('./app/**/*.js', { ignoreInitial: false }, ['concat']);
});
gulp.task('watch-css', () => {
  gulp.watch('./app/**/*.scss', { ignoreInitial: false }, ['sass']);
});
gulp.task('watch', ['watch-css', 'watch-js', 'watch-html']);

gulp.task('serve', () => {
  browser.init({
    server: { baseDir: './dist' },
    files: ['./dist/**/*.*'],
    notify: false,
    reloadDebounce: 500,
  });
});

gulp.task('develop', ['index', 'views', 'concat', 'sass', 'watch', 'serve']);
