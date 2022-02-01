const gulp = require("gulp");

const ts = require("gulp-typescript");
const typescript = ts.createProject("./tsconfig.json");
const sourcemaps = require("gulp-sourcemaps");
const eslint = require("gulp-eslint");

const lint = () => {
    return gulp.src("./src/**.ts")
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
}

const build = () => {
    return gulp.src("src/**.ts")
        .pipe(sourcemaps.init())
            .pipe(typescript())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist"));
}

gulp.task("lint", lint);
gulp.task("build", build);
gulp.task("default", gulp.series(lint, build));
