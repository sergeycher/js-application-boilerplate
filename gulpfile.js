var gulp = require('gulp');

var watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    notify = require("gulp-notify"),
    templatesBuilder = require('gulp-templates-concat'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify');

var mainBowerFiles = require('main-bower-files');

var CFG = {
    "src": {
        "root": "_src/"
    },
    "dest": {
        "root": "web/app/",
        "js": "index.js",
        "styles": "app.css",
        "templates": "templates.js"
    }
};

//finally, build all sources from cache
//i dont know how to merge two threads in right order
gulp.task('js:build', ['js:build-app'], function () {
    var cache = CFG.src.root + 'cache/';

    return gulp.src([
        cache + 'libs.js',
        cache + 'app.js'
    ]).pipe(concat(CFG.dest.js))
        .pipe(gulp.dest(CFG.dest.root));
});

gulp.task('js:build-app', function () {
    return gulp.src(CFG.src.root + 'js/index.js')
        .pipe(rigger())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(CFG.src.root + 'cache'));
});

gulp.task('js:build-libs', function () {
    return gulp.src(mainBowerFiles('**/*.js'))
        .pipe(concat('libs.js'))
        .pipe(uglify())
        .pipe(gulp.dest(CFG.src.root + 'cache'));
});

gulp.task('css', function () {
    //libs
    var src = mainBowerFiles('**/*.css').concat([CFG.src.styles.foreign + '**/*.css']);
    gulp.src(src)
        .pipe(concat(CFG.dest.foreignStyles))
        .pipe(gulp.dest(CFG.dest.root))
        .pipe(connect.reload());

});

gulp.task('less', function () {
    //less
    gulp.src(CFG.src.styles.root + 'index.less')
        .pipe(plumber({
            errorHandler: true
        }))
        .pipe(less())
        .on("error", notify.onError(function (error) {
            return "LESS: " + error.message;
        }))
        .pipe(plumber.stop())
        .pipe(concat(CFG.dest.styles))
        .pipe(gulp.dest(CFG.dest.root))
        .pipe(connect.reload());
});

gulp.task('templates', function () {
    var root = CFG.src.templates.root;

    gulp.src(root + "**/*.html")
        .pipe(templatesBuilder(CFG.dest.templates, {
            root: root,
            var: "_templates"
        }))
        .pipe(gulp.dest(CFG.dest.root))
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    watch([CFG.src.js.root + '**/*.js'], function (event, cb) {
        gulp.start('js');
    });
    watch([CFG.src.styles.root + '**/*.less', CFG.src.styles.root + '**/*.css'], function (event, cb) {
        gulp.start('less');
    });
});

gulp.task('webserver', function () {
    connect.server({
        host: 'localhost',
        port: 9000,
        livereload: true
    });
});

gulp.task('styles', ['css', 'less']);
gulp.task('build', ['styles', 'js', 'libs']);

gulp.task('default', ['build', 'webserver', 'watch']);