"use-strict";

var gulp = require('gulp'),
		concatCss = require('gulp-concat-css'),
		connect = require('gulp-connect'),
		ftp = require('vinyl-ftp'),
		gutil = require('gulp-util'),
		livereload = require('gulp-livereload'),
		minifyCss = require('gulp-minify-css'),
		notify = require('gulp-notify'),
		prefix = require('gulp-autoprefixer'),      
		rename = require('gulp-rename'),
		sass = require('gulp-sass'),
		uncss = require('gulp-uncss');


//connect - https://www.npmjs.com/package/gulp-connect/
gulp.task('connect', function() {
  connect.server({
	root: 'app',
	port: '8080',  // добавил
	livereload: true
  });
});

// uncss -  remove unwanted styles
gulp.task('uncss', function () {
	return gulp.src('bower_components/bootstrap/dist/css/bootstrap.css')
		.pipe(uncss({
			html: ['app/index.html']  //смотрим, какие стили использует html
		}))
		.pipe(gulp.dest('app/css'));
});

// css
gulp.task('css', function () {
  return gulp.src('scss/style.scss')
	.pipe(sass())
	.pipe(prefix({browsers: ['last 2 versions', '> 1%', 'ie 8'], cascade: false}))
	.pipe(minifyCss())
	.pipe(rename('bundle.min.css'))
	.pipe(gulp.dest('app'))
	.pipe(connect.reload());   
});
 
// html
gulp.task('html', function() {
	gulp.src('app/index.html')
	.pipe(connect.reload());
})

gulp.task('watch', function() {
		gulp.watch('css/*.css', ['css'])
		gulp.watch('app/index.html', ['html'])
})

// default
gulp.task('default', ['connect', 'html', 'css', 'watch']);

// попытки подключиться к серверу по ftp (sftp) не увенчались успехом

// ftp  - не работает. Не могу подключиться к серверу
gulp.task('ftp', function () {
	return gulp.src('app/**.*')
		.pipe(ftp({
			host: 'add.lekua.in.ua/loftblog/',
			user: 'lekua_ftp',
			pass: 'Aa3XEV7F',
			remotePath: '/home/lekua/'
		}))
		.pipe(gutil.noop());
});

// deploy - передаем файлы по ftp на сервер
gulp.task( 'deploy', function () {
 
	var conn = ftp.create( {
		host:     'lekua.in.ua',
		user:     'lekua_ftp',
		password: 'Aa3XEV7F',  // Aa3XEV7F
		parallel: 10,
		log:      gutil.log
	} );
 
	var globs = [
		'css/**',
		'index.html'
	];
 
	// using base = '.' will transfer everything to /public_html correctly 
	// turn off buffering in gulp.src for best performance 
 
	return gulp.src( globs, { base: '.', buffer: false } )
		.pipe( conn.newer( '/home/lekua/' ) ) // only upload newer files /public_html
		.pipe( conn.dest( '/home/lekua/' ) );
 
} );