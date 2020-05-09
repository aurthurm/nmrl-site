"use strict";

const gulp = require("gulp"),
  babel = require("gulp-babel"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  rename = require("gulp-rename"),
  cleanCSS = require("gulp-clean-css"),
  del = require("del"),
  imagemin = require("gulp-imagemin"),
  browsersync = require("browser-sync"),
  server = browsersync.create(),
  postcss = require("gulp-postcss");

const paths = {
  styles: {
    src: "app/css/**/*.css",
    dest: "app/assets/css/",
  },
  scripts: {
    src: "app/js/**/*.js",
    dest: "app/assets/js/",
  },
  images: {
    src: "app/images/**/*.{jpg,jpeg,png,svg}",
    dest: "app/assets/img/",
  },
};

// Tasks
function styles() {
  return (
    gulp
      .src(paths.styles.src)
      .pipe(postcss([require("tailwindcss"), require("autoprefixer")]))
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(cleanCSS())
      // pass in options to the stream
      .pipe(
        rename({
          basename: "main",
          suffix: ".min",
        })
      )
      .pipe(gulp.dest(paths.styles.dest))
  );
}

function clean() {
  return del(["./app/assets/"]);
}

function scripts() {
  return (
    gulp
      .src(paths.scripts.src, {
        sourcemaps: true,
      })
      .pipe(babel())
      // .pipe(uglify())
      // .pipe(concat('main.min.js'))
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(uglify())
      .pipe(concat("main.min.js"))
      .pipe(gulp.dest(paths.scripts.dest))
  );
}

function images() {
  return gulp
    .src(paths.images.src, {
      since: gulp.lastRun(images),
    })
    .pipe(
      imagemin({
        optimizationLevel: 5,
      })
    )
    .pipe(gulp.dest(paths.images.dest));
}

function fonts() {
  return gulp.src("app/fonts/**/*").pipe(gulp.dest("app/assets/fonts"));
}

function browserSync(done) {
  server.init({
    server: {
      baseDir: "./app/",
    },
    port: 3000,
  });
  done();
}

function browserSyncReload(done) {
  server.reload();
  done();
}

// get bootstrap js and j query js
// function getjs() {
//   return gulp
//     .src([
//       "node_modules/jquery/dist/jquery.min.js",
//       "node_modules/bootstrap/dist/js/bootstrap.min.js",
//     ])
//     .pipe(gulp.dest("app/assets/js/"));
// }

function watch() {
  gulp.watch(paths.scripts.src, gulp.series(scripts, browserSyncReload));
  gulp.watch(paths.styles.src, gulp.series(styles, browserSyncReload));
  gulp.watch(paths.images.src, gulp.series(images, browserSyncReload));
  gulp.watch("app/**/*.html", browserSyncReload);
}

function fetch() {
  return gulp.series(clean, gulp.parallel(scripts, styles, images, fonts));
}

// gulp.task("dev", gulp.series(fetch, gulp.parallel(browserSync, watch)));

gulp.task(
  "develop",
  gulp.series(
    clean,
    gulp.parallel(scripts, styles, images, fonts),
    browserSync,
    watch
  )
);
