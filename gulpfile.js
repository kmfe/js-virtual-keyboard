'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;


gulp.task('sass', function () {
    return gulp.src('./style/**/*.scss')
        .pipe(sass({sourcemap: true}).on('error', sass.logError))
        .pipe(gulp.dest('./style/'))
        .pipe(reload({stream: true}));
});

gulp.task('serve', gulp.series( gulp.parallel('sass'), function () {
    browserSync.init({
        server: {
            baseDir: ['./', './example' , './ipad-keyboard']
        }
    });
    gulp.watch('./style/**/*.scss', gulp.task('sass'));
    gulp.watch("./style/*.scss", gulp.task('sass'));

    gulp.watch("./example/*.html").on('change', reload);
}));

gulp.task('default', gulp.series( gulp.parallel('serve'), function () {
}));