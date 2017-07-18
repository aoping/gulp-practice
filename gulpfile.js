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
var livereload = require('gulp-livereload');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant'); // 使用pngquant深度压缩png图片的imagemin插件
var cache = require('gulp-cache');
var cssmin = require('gulp-minify-css');
var cssver = require('gulp-make-css-url-version');
var rev = require('gulp-rev-append');

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

// // html
// gulp.task('html', function() {
//     return gulp.src('app/*html')
//         .pipe(gulp.dest('dist'));
// });
gulp.task('testHtmlmin', function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    gulp.src('app/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist'));
});

// 创建一个任务确保JS任务完成之前能够继续响应
// 浏览器重载
gulp.task('js-watch', ['js'], browserSync.reload);


// //定义一个testLess任务（自定义任务名称）
// gulp.task('less', function() {
//     gulp.src('app/less/index2.less') //该任务针对的文件
//         .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
//         .pipe(sourcemaps.init())
//         .pipe(less()) //该任务调用的模块
//         .pipe(cssmin()) // 兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
//         .pipe(sourcemaps.write())
//         .pipe(gulp.dest('dist/css')); //将会在src/css下生成index.css
// });

gulp.task('less', function() {
    gulp.src('app/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('dist/css'))
        .pipe(livereload());
});

//特别注意：若编译less的时候，同时执行其他操作，有可能引起页面刷新，而不是将样式植入页面
//例如下面任务同时生成sourcemap：
//var sourcemaps = require('gulp-sourcemaps');
//gulp.task('less', function () {
//    gulp.src(['src/less/*.less'])
//        .pipe(sourcemaps.init())
//        .pipe(less())
//        .pipe(sourcemaps.write('./'))
//        .pipe(gulp.dest('src/css'))
//        .pipe(livereload());
//});

gulp.task('watch-less', function() {
    livereload.listen();
    gulp.watch('app/less/**/*.less', ['less']);
});

gulp.task('testImagemin', function() {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});
gulp.task('testImagemin2', function() {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('dist/img'));
});
//深度压缩图片
gulp.task('testImagemin3', function() {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        }))
        .pipe(gulp.dest('dist/img'));
});
//只压缩修改的图片
gulp.task('testImagemin', function() {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('testCssmin', function() {
    gulp.src('src/css/*.css')
        .pipe(cssver()) //给css文件里引用文件加版本号（文件MD5）
        .pipe(cssmin({
            advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
                //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('testRev', function() {
    gulp.src('src/html/index.html')
        .pipe(rev())
        .pipe(gulp.dest('dist/html'));
});
var gulp = require('gulp'),
    uglify = require('gulp-uglify');

gulp.task('jsmin', function() {
    gulp.src(['src/js/*.js', '!src/js/**/{test1,test2}.js'])
        .pipe(uglify({
            mangle: true, //类型：Boolean 默认：true 是否修改变量名
            compress: true, //类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        }))
        .pipe(gulp.dest('dist/js'));
});
gulp.task('default', ['serve']);