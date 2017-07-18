var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify'); // 用于把依赖也打进同一个包
var reload = browserSync.reload;
var less = require('gulp-less');
var cssmin = require('gulp-minify-css');
//确保本地已安装gulp-sourcemaps [cnpm install gulp-sourcemaps --save-dev]
var sourcemaps = require('gulp-sourcemaps'); // 审查元素时会是在源文件里
//当发生异常时提示错误 确保本地安装gulp-notify和gulp-plumber
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');


// 静态服务器 + 监听 scss/html 文件
gulp.task('serve', ['sass', 'less', 'js', 'html'], function() {

    browserSync.init({
        server: "./dist"
    });
    // 添加 browserSync.reload 到任务队列里
    // 所有的浏览器重载后任务完成。
    gulp.watch("app/js/*.js", ['js-watch']);
    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/less/*.less", ['less']);
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


//定义一个testLess任务（自定义任务名称）
gulp.task('less', function() {
    gulp.src('app/less/index2.less') //该任务针对的文件
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(sourcemaps.init())
        .pipe(less()) //该任务调用的模块
        .pipe(cssmin()) // 兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css')); //将会在src/css下生成index.css
});

gulp.task('default', ['serve']);