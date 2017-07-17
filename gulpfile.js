var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify'); // 用于把依赖也打进同一个包
var reload = browserSync.reload;

// 静态服务器 + 监听 scss/html 文件
gulp.task('serve', ['sass', 'js', 'html'], function() {

    browserSync.init({
        server: "./dist"
    });
    // 添加 browserSync.reload 到任务队列里
    // 所有的浏览器重载后任务完成。
    gulp.watch("app/js/*.js", ['js-watch']);
    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/*.html", ['html']).on('change', reload);
});

// scss编译后的css将注入到浏览器里实现更新
gulp.task('sass', function() {
    return gulp.src("app/scss/*.scss")
        .pipe(sass({ sourcemap: true }))
        .pipe(gulp.dest('dist/css')) // Write the CSS & Source maps
        .pipe(filter('**/*.css')) // Filtering stream to only css files
        .pipe(reload({ stream: true }));
});

// 处理完JS文件后返回流
gulp.task('js', function() {
    return gulp.src('app/js/*js')
        .pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

// html
gulp.task('html', function() {
    return gulp.src('app/*html')
        .pipe(gulp.dest('dist'));
});
// 创建一个任务确保JS任务完成之前能够继续响应
// 浏览器重载
gulp.task('js-watch', ['js'], browserSync.reload);

gulp.task('default', ['serve']);