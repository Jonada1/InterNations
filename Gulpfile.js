var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    babel = require('gulp-babel'),
    pump = require('pump'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    environments = require('gulp-environments'),
    del = require('del'),
    imagemin = require('gulp-imagemin');

let development = environments.development;
let production = environments.production;

let config = {
    src: {
        htmlFiles: '*.html',
        jsFiles: 'src/assets/js/*.js',
        scssFiles: 'src/assets/scss/*.scss',
        imgFiles: 'src/assets/images/**',
        fontFiles: 'src/assets/fonts/**',
        thirdParty: 'src/assets/third-party/**/*'
    },
    dest: {
        htmlFiles: 'web/',
        jsFiles: 'web/assets/js',
        cssFiles: 'web/assets/css',
        imgFiles: 'web/assets/images',
        fontFiles: 'web/assets/fonts',
        thirdParty: 'web/assets/third-party'
    },
    browserSyncOptions: {
        server: {
            baseDir: '.',
            port: 8000
        },
    },
    autoprefixerOptions: {
        browsers: ['> 0.1%'],
        cascade: false
    },
    uglifyOptions: {
        mangle: true,
        compress: {
            sequences: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            unused: true,
            if_return: true,
            join_vars: true,
            drop_console: true
        }
    },
    sassOptions: {
        outputStyle: development() ? 'expanded' : 'compressed'
    }
};

gulp.task('jshint', () => {
    "use strict";
    return gulp.src(config.src.jsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('handleJSFiles', (cb) => {
    "use strict";
    pump([
        gulp.src(config.src.jsFiles),
        development(sourcemaps.init()),
        development(jshint()),
        development(jshint.reporter(stylish)),
        babel(),
        production(uglify(config.uglifyOptions)),
        development(sourcemaps.write('.')),
        gulp.dest(config.dest.jsFiles)
    ],
        cb
    );
});

gulp.task('handleSCSSFiles', () => {
    "use strict";
    return gulp.src(config.src.scssFiles)
        .pipe(development(sourcemaps.init()))
        .pipe(sass(config.sassOptions).on('error', sass.logError))
        .pipe(autoprefixer(config.autoprefixerOptions))
        .pipe(development(sourcemaps.write('.')))
        .pipe(gulp.dest(config.dest.cssFiles))
        .pipe(development(browserSync.stream()))
});

gulp.task('handleIMGFiles', () => {
    "use strict";
    return gulp.src(config.src.imgFiles)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({ plugins: [{ removeViewBox: true }] })
        ]))
        .pipe(gulp.dest(config.dest.imgFiles))
});

gulp.task('handleFontFiles', () => {
    "use strict";
    return gulp.src(config.src.fontFiles)
        .pipe(gulp.dest(config.dest.fontFiles))
});

gulp.task('handleThirdPartyLibs', () => {
    return gulp.src(config.src.thirdParty)
        .pipe(gulp.dest(config.dest.thirdParty));
});

gulp.task('serve', ['handleSCSSFiles', 'handleJSFiles', 'handleIMGFiles', 'handleFontFiles', 'handleThirdPartyLibs'], () => {
    if (development()) {
        gulp.watch(['./Gulpfile.js'], ['jshint']);
        browserSync.init(config.browserSyncOptions);

        gulp.watch(config.src.scssFiles, ['handleSCSSFiles']).on('change', (event) => {
            "use strict";
            gutil.log(gutil.colors.bgBlue('Sass File ==>' + event.path + ' was ' + event.type + ', running tasks...'));
            browserSync.reload();
        });

        gulp.watch(config.src.jsFiles, ['handleJSFiles']).on('change', (event) => {
            gutil.log(gutil.colors.bgBlue('Javascript File ==>' + event.path + ' was ' + event.type + ', running tasks...'));
            browserSync.reload();
        });

        gulp.watch(config.src.htmlFiles).on('change', (event) => {
            "use strict";
            gutil.log(gutil.colors.bgBlue('Html File ==>' + event.path + ' was ' + event.type + ', running tasks...'));
            browserSync.reload();
        });
    }
});

gulp.task('clean', () => {
    return del.sync(['web/assets/css', 'web/assets/js', 'web/assets/images', 'web/assets/fonts', 'web/assets/third-party']);
});

// build 
gulp.task('build', ['clean', 'handleSCSSFiles', 'handleJSFiles', 'handleIMGFiles', 'handleFontFiles', 'handleThirdPartyLibs']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});