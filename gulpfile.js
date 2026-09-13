const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

gulp.task('html', function() {
    return gulp.src([
        'src/app/**/*.html',
        '!src/app/components/**/*.html'
    ])
    .pipe(fileInclude({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

gulp.task('sass', function(){
    return gulp.src('src/app/scss/**/*.scss')
        .pipe(sass().on('eror', sass.logError))
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.stream());
});

gulp.task('java', function() {
    return gulp.src('src/app/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.stream());
});

gulp.task('img', function() {
    return gulp.src('src/app/imgs/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/imgs/'))
        .pipe(browserSync.stream());
});

gulp.task('sync', function() {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        notify: false
    });
});

gulp.task('watch', function() {
    gulp.watch('src/app/**/*.html', gulp.series('html'));
    gulp.watch('src/app/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('src/app/js/**/*.js', gulp.series('java'));
    gulp.watch('src/app/imgs/**/*', gulp.series('img'));
});

gulp.task('default', gulp.series(
    gulp.parallel('html', 'sass', 'java', 'img'),
    gulp.parallel('sync', 'watch')
));