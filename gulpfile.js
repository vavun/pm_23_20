const fs = require('fs');
const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

const paths = {
    src: 'src/app',
    dist: 'dist',
    html: ['src/app/**/*.html', '!src/app/components/**/*.html'],
    htmlWatch: 'src/app/**/*.html',
    scss: 'src/app/scss/**/*.scss',
    js: 'src/app/js/**/*.js',
    imgs: 'src/app/imgs/**/*'
};

// Логування помилки без зупинки watcher
function handleError(err) {
    console.error(err.toString());
    this.emit('end');
}

// 0. Очищення папки dist (щоб видалені у src файли не залишались у збірці)
function clean(done) {
    fs.rmSync(paths.dist, { recursive: true, force: true });
    done();
}

// 1. HTML з підтримкою file include (header, footer тощо)
function html() {
    return gulp.src(paths.html)
        .pipe(fileInclude({ prefix: '@@', basepath: '@file' }).on('error', handleError))
        .pipe(gulp.dest(paths.dist))
        .pipe(browserSync.stream());
}

// 2. Компіляція SCSS у CSS з мініфікацією
function styles() {
    return gulp.src(paths.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(gulp.dest(`${paths.dist}/css`))
        .pipe(browserSync.stream());
}

// 3. JavaScript: об'єднання всіх файлів в один і мініфікація
function scripts() {
    return gulp.src(paths.js)
        .pipe(concat('main.js'))
        .pipe(uglify().on('error', handleError))
        .pipe(gulp.dest(`${paths.dist}/js`))
        .pipe(browserSync.stream());
}

// 4. Оптимізація зображень
// { encoding: false } — щоб Gulp 5 не перетворював бінарні файли на текст
function images() {
    return gulp.src(paths.imgs, { encoding: false })
        .pipe(imagemin({ verbose: true }).on('error', handleError))
        .pipe(gulp.dest(`${paths.dist}/imgs`))
        .pipe(browserSync.stream());
}

// 5. Локальний сервер з автоматичним оновленням браузера
function serve(done) {
    browserSync.init({
        server: { baseDir: `./${paths.dist}` },
        notify: false
    });
    done();
}

// 6. Watcher, який відслідковує зміни у проєкті
function watch(done) {
    gulp.watch(paths.htmlWatch, html);
    gulp.watch(paths.scss, styles);
    gulp.watch(paths.js, scripts);
    gulp.watch(paths.imgs, images);
    done();
}

const build = gulp.series(clean, gulp.parallel(html, styles, scripts, images));

exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.build = build;
exports.default = gulp.series(build, serve, watch);