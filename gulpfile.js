import gulpModule from "gulp"
import gulpPug from "gulp-pug"
import pugLinter from "gulp-pug-linter"
import gulpSass from "gulp-sass"
import autoprefixer from "gulp-autoprefixer"
import htmlMin from "gulp-htmlmin"
import imageMin, { gifsicle, mozjpeg, optipng, svgo } from "gulp-imagemin"
import del from "del"
import browserSyncModule from "browser-sync"
import gulpUglify from "gulp-uglify"
import concat from "gulp-concat"

const { src, dest, watch, series, parallel } = gulpModule
const browserSync = browserSyncModule.create()

function pug() {
	return src("./src/pug/*.pug")
		.pipe(pugLinter({ reporter: "default" }))
		.pipe(
			gulpPug({
				pretty: true,
			})
		)
		.pipe(
			htmlMin({
				collapseWhitespace: true,
				removeComments: true,
			})
		)
		.pipe(dest("./docs/"))
		.pipe(browserSync.stream())
}

function sass() {
	return src("./src/sass/*.sass")
		.pipe(
			gulpSass({
				outputStyle: "compressed",
			})
		)
		.pipe(autoprefixer())
		.pipe(dest("./docs/style/"))
		.pipe(browserSync.stream())
}

function scripts() {
	return src("./src/scripts/**/*.js")
		.pipe(gulpUglify())
		.pipe(concat("bundle.js"))
		.pipe(dest("./docs/scripts/"))
}

function imageMinify() {
	return src("src/img/*.{gif,png,jpg,svg,webp}")
		.pipe(
			imageMin([
				gifsicle({ interlaced: true }),
				mozjpeg({
					quality: 75,
					progressive: true,
				}),
				optipng({ optimizationLevel: 5 }),
				svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest("docs/img"))
}

function clear() {
	return del("./docs")
}

function serve() {
	browserSync.init({
		server: "./docs/",
	})

	watch("./src/pug/**/*.pug", series(pug)).on("change", browserSync.reload)
	watch("./src/sass/**/*.sass", series(sass)).on("change", browserSync.reload)
	watch("./src/scripts/**/*.js", series(scripts)).on("change", browserSync.reload)
	watch("./src/img/*.{gif,png,jpg,svg,webp}", series(imageMinify)).on("change", browserSync.reload)
	watch("src/pages/**/*.pug", series(pug)).on("change", browserSync.reload)
	watch("*.html").on("change", browserSync.reload)
}

export const build = series(clear, parallel(pug, sass, imageMinify, scripts))
export const dev = series(clear, parallel(pug, sass, imageMinify, scripts), serve)
