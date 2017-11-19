const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const flatten = require('gulp-flatten');
const sourceMaps = require('gulp-sourcemaps');
const pump = require('pump'); // improves error reporting over using pipe
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const browserSync = require('browser-sync').create();

const folders = {
  src: 'src',
  dist: 'dist',
};

gulp.task('min-js', (cb) => {
  pump([
    gulp.src(`${folders.src}/app/**/*.js`),
    babel({ presets: ['es2015'] }),
    concat('app.min.js'),
    sourceMaps.init(),
    uglify(),
    sourceMaps.write(),
    gulp.dest(folders.dist),
  ], cb);
});

gulp.task('js', (cb) => {
  pump([
    gulp.src(`${folders.src}/app/**/*.js`),
    babel({ presets: ['es2015'] }),
    concat('app.min.js'),
    gulp.dest(folders.dist),
  ], cb);
});

gulp.task('copyRootFiles', (cb) => {
  pump([
    gulp.src([`${folders.src}/index.html`, `${folders.src}/manifest.webmanifest`]),
    gulp.dest(folders.dist),
  ], cb);
});

gulp.task('views', (cb) => {
  pump([
    gulp.src(`${folders.src}/app/**/*.html`),
    flatten(),
    gulp.dest(`${folders.dist}/views`),
  ], cb);
});

gulp.task('css', (cb) => {
  pump([
    gulp.src([
      `${folders.src}/**/*.scss`,
      `${folders.src}/assets/scss/font-awesome.scss`,
    ]),
    sourceMaps.init(),
    sass(),
    sourceMaps.write(),
    concat('app.min.css'),
    gulp.dest('dist'),
  ], cb);
});

gulp.task('img', (cb) => {
  pump([
    gulp.src(`${folders.src}/assets/img/**/*.*`),
    flatten(),
    gulp.dest(`${folders.dist}/img`),
  ], cb);
});

gulp.task('fonts', (cb) => {
  pump([
    gulp.src(`${folders.src}/assets/fonts/*.*`),
    flatten(),
    gulp.dest(`${folders.dist}/fonts`),
  ], cb);
});

gulp.task('libs', (cb) => {
  pump([
    gulp.src([
      'node_modules/angular/angular.min.js',
      'node_modules/@uirouter/angularjs/release/angular-ui-router.min.js',
      'node_modules/firebase/firebase.js',
      'node_modules/angularfire/dist/angularfire.min.js',
    ]),
    concat('libs.js'),
    gulp.dest('dist'),
  ], cb);
});

gulp.task('build', ['js', 'libs', 'copyRootFiles', 'views', 'css', 'img', 'fonts']);
gulp.task('release-build', ['min-js', 'libs', 'copyRootFiles', 'views', 'css', 'img', 'fonts']);

gulp.task('watch', () => {
  gulp.watch(`${folders.src}/app/**/*.js`, ['js']);
  gulp.watch([`${folders.src}/index.html`, `${folders.src}/manifest.webmanifest`], ['copyRootFiles']);
  gulp.watch(`${folders.src}/app/**/*.html`, ['views']);
  gulp.watch(`${folders.src}/**/*.scss`, ['css']);
});

gulp.task('serve', () => {
  browserSync.init({
    server: { baseDir: './dist' },
    files: ['./dist/**/*.*'],
    notify: false,
    reloadDebounce: 500,
  });
});

gulp.task('staging-to-production', () => {
  const firebaseConfigPath = `${folders.src}/app/firebase.config.js`;
  gulp.src(firebaseConfigPath)
    .pipe(replace('AIzaSyCsR30o5Qj5GJEYGSxvU_oA2M6Nzdux-5w', 'AIzaSyAjirPFyKoMnzRqmAZSNz8avf_F9TVnvyI'))
    .pipe(replace(/fourpaths-staging/g, 'four-paths'))
    .pipe(replace('747528943665', '943029334732'))
    .pipe(gulp.dest(`${folders.src}/app`));
});
gulp.task('production-to-staging', () => {
  const firebaseConfigPath = `${folders.src}/app/firebase.config.js`;
  gulp.src(firebaseConfigPath)
    .pipe(replace('AIzaSyAjirPFyKoMnzRqmAZSNz8avf_F9TVnvyI', 'AIzaSyCsR30o5Qj5GJEYGSxvU_oA2M6Nzdux-5w'))
    .pipe(replace(/four-paths/g, 'fourpaths-staging'))
    .pipe(replace('943029334732', '747528943665'))
    .pipe(gulp.dest(`${folders.src}/app`));
});

gulp.task('develop', ['build', 'watch', 'serve']);
