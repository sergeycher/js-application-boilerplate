var gulp = require('gulp'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    notify = require("gulp-notify"),
    templatesBuilder = require('gulp-templates-concat'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify'),
    mainBowerFiles = require('main-bower-files');

var CFG = {
    "src": {
        "root": "_src/"
    },
    "dest": {
        "root": "web/app/",
        "js": "index.js",
        "styles": "index.css",
        "templates": "templates.js"
    }
};

var cacheDir = CFG.src.root + 'cache';

//finally, build all sources from cache
//i dont know how to merge two threads in right order
gulp.task('js:build', function () {
    return gulp.src([
        cacheDir + '/libs.js',
        cacheDir + '/app.js'
    ]).pipe(concat(CFG.dest.js))
        .pipe(gulp.dest(CFG.dest.root))
        .pipe(connect.reload());
});

gulp.task('js:build-app', function () {
    return gulp.src(CFG.src.root + 'js/index.js')
        .pipe(rigger())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(cacheDir));
});

gulp.task('js:build-libs', function () {
    return gulp.src(mainBowerFiles('**/*.js'))
        .pipe(concat('libs.js'))
        .pipe(uglify())
        .pipe(gulp.dest(cacheDir));
});

// - - - - - STYLES - - - - -

gulp.task('styles:build', function () {
    gulp.src([
        cacheDir + '/libs.css',
        cacheDir + '/app.css'
    ])
        .pipe(concat(CFG.dest.styles))
        .pipe(gulp.dest(CFG.dest.root))
        .pipe(connect.reload());
});

gulp.task('styles:build-app', function () {
    gulp.src(CFG.src.root + 'styles/index.less')
        .pipe(plumber({
            errorHandler: true
        }))
        .pipe(less())
        .on("error", notify.onError(function (error) {
            return "LESS: " + error.message;
        }))
        .pipe(plumber.stop())
        .pipe(concat('app.css'))
        .pipe(gulp.dest(cacheDir));
});

gulp.task('styles:build-libs', function () {
    gulp.src(mainBowerFiles('**/*.css'))
        .pipe(concat('libs.css'))
        .pipe(gulp.dest(cacheDir));
});

// - - - - - TEMPLATES - - - - -

gulp.task('templates:build', function () {
    var root = CFG.src.root + 'templates/';

    gulp.src(root + "**/*.html")
        .pipe(templatesBuilder(CFG.dest.templates, {
            root: root,
            var: "_templates"
        }))
        .pipe(gulp.dest(CFG.dest.root))
        .pipe(connect.reload());
});

// - - - - - WATCHER - - - - -

gulp.task('watch', function () {
    watch([CFG.src.root + 'js/**/*.js'], function () {
        gulp.start('js:build-app');
    });
    watch([CFG.src.root + 'styles/**/*.less', CFG.src.root + 'styles/**/*.css'], function () {
        gulp.start('styles:build-app');
    });
    watch([CFG.src.root + 'templates/**/*.html'], function () {
        gulp.start('templates:build');
    });

    watch([CFG.src.root + 'cache/**/*.js'], function () {
        gulp.start('js:build');
    });
    watch([CFG.src.root + 'cache/**/*.css'], function () {
        gulp.start('styles:build');
    });
});

gulp.task('webserver', function () {
    connect.server({
        host: 'localhost',
        port: 9000,
        livereload: true
    });
});

gulp.task('build', [
    'js:build-libs',
    'js:build-app',
    'styles:build-libs',
    'styles:build-app',
    'templates:build'
], function () {
    gulp.start('js:build');
    gulp.start('styles:build');
});

gulp.task('default', ['watch', 'webserver', 'build']);
