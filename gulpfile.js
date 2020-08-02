const gulp       = require('gulp'),
      browserify = require('browserify'),
      uglify     = require('gulp-uglify'),
      babelify   = require('babelify'),
      source     = require('vinyl-source-stream'),
      streamify  = require('gulp-streamify'),
      shell      = require('gulp-shell'),
      zip        = require('gulp-zip');

const dirName = 'statr';

gulp.task('scripts:dev', () => {
  return browserify('src/scripts/main.js')
    .transform(babelify, {presets: ['es2015']})
    .bundle()
    .pipe(source('content.js'))
    .pipe(gulp.dest(dirName+'/scripts'));
});

gulp.task('scripts:prod', () => {
  return browserify('src/scripts/main.js')
    .transform(babelify, {presets: ['es2015']})
    .bundle()
    .pipe(source('content.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(dirName+'/scripts'));
});

gulp.task('prep', shell.task([
  'rm -rf '+dirName,
  'mkdir '+dirName,
  'cp misc/manifest.json '+dirName,
  'cp -R src/www '+dirName+'/app/',
  'mkdir cpa',
  'cp assets/* cpa',
  'mv cpa '+dirName+'/assets'
]));

gulp.task('js:prod', ['prep'], shell.task([
  'webpack -p --config webpack.config.js'
]));

gulp.task('js:dev', ['prep'], shell.task([
  'webpack --config webpack.config.js'
]));

gulp.task('watch', ['prep', 'scripts:dev'], () => {
  gulp.watch(['src/scripts/main.js'], ['scripts:dev']);
  gulp.start('watcher');
});

gulp.task('watcher', shell.task([
  'webpack --config webpack.config.js --watch'
]));

gulp.task('prod', () => {
  return process.env.NODE_ENV = 'production';
});

gulp.task('final:prod', ['prod','js:prod', 'scripts:prod']);
gulp.task('final:dev', ['js:dev', 'scripts:dev']);

gulp.task('release', ['final:prod'], () => {
  gulp.src(dirName+'/**/*')
    .pipe(zip('statr.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['final:dev']);
