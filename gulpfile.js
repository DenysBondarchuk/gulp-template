const gulp   		= require('gulp');
const browserSync   = require('browser-sync');
const sass   		= require('gulp-sass');
const concat 		= require('gulp-concat');
const autoprefixer  = require('gulp-autoprefixer');
const sourcemaps    = require('gulp-sourcemaps');
const csso   		= require('gulp-csso');
const include     	= require('gulp-include');
const del     		= require('del');
const runSequence 	= require('run-sequence');
const fs 			= require('fs');
const wait 			= require('gulp-wait');
const svgmin 		= require('gulp-svgmin');
const zip 			= require('gulp-zip');

let path = {
	src: {
		html: 'app/*.html',
		style: 'app/style/main.sass',
		scripts: 'app/js/**/*.js',
		img: 'app/img/*.+(jpg|jpeg|png|svg|ico|gif)',
		svg: 'app/img/**/*.svg',
		fonts: 'app/fonts/**/*',
		localization: "app/localization/*.json"
	},
	build: {
		html: 'build',
		style: 'build/css',
		scripts: 'build/js',
		img: 'build/img',
		fonts: 'build/fonts',
		localization: "build/localization"
	},
	watch: {
		htmlApp: 'app/*.html',
		html: 'app/components/**/*.html',
		style: 'app/**/*.+(sass|scss)',
		scripts: 'app/**/*.js',
		img: 'app/img/*.+(jpg|jpeg|png|svg|ico|gif)',
		svg: 'app/img/**/*.svg',
		fonts: 'app/fonts/**/*'
	}
};

gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir: 'build'
		},
		notify: false,
		tunnel: false,
		port: 8000,
  		host: "localhost"
	});
});

gulp.task('html', function() {
	return gulp.src(path.src.html)
		.pipe(include())
		.pipe(gulp.dest(path.build.html))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('style', function(done){
	gulp.src(path.src.style)
		.pipe(sourcemaps.init())
  		.pipe(wait(100))
    	.pipe(sass().on('error', function(error) {
        	done(error);
      	}))
    	.pipe(concat('main.css'))
    	.pipe(autoprefixer({
    	  browsers: ['last 2 versions'],
    	  cascade: false 
    	}))
    	.pipe(csso({
    		// forceMediaMerge: true
    	}))
    	.pipe(sourcemaps.write())
    	.pipe(gulp.dest(path.build.style))
    	.on('end', function() {
        	done();
      	})
    	.pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function() {
	return gulp.src(path.src.scripts)
		.pipe(sourcemaps.init())
		.pipe(include())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.scripts))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('img', function() {
	return gulp.src(path.src.img)
	  	.pipe(gulp.dest(path.build.img))
	  	.pipe(browserSync.reload({stream: true}));
});

gulp.task('svg', function() {
	return gulp.src(path.src.svg)
		.pipe(svgmin({
            plugins: [{
                removeViewBox: false
            }]
        }))
	  	.pipe(gulp.dest(path.build.img))
	  	.pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts', function() {
	return gulp.src(path.src.fonts)
	  	.pipe(gulp.dest(path.build.fonts))
	  	.pipe(browserSync.reload({stream: true}));
});

gulp.task('localization', function() {
	return gulp.src(path.src.localization)
		.pipe(include())
		.pipe(gulp.dest(path.build.localization))
});

gulp.task('deploy:style', function(){
	return gulp.src(path.src.style)
		.pipe(sass())
		.pipe(concat('main.css'))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false 
		}))
		.pipe(csso({
    		// forceMediaMerge: true
    	}))
		.pipe(gulp.dest(path.build.style))
});

gulp.task('deploy:scripts', function() {
	return gulp.src(path.src.scripts)
		.pipe(include())
		.pipe(gulp.dest(path.build.scripts))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('clean', function() {
	return del.sync('build/*')
});

const name = process.argv[process.argv.length - 1].split('--')[1];
const level = process.argv[process.argv.length - 1].split('--')[2];

gulp.task('folder', function () {
    return gulp.src('*.*', {read: false})
        .pipe(gulp.dest('app/components/'+ name))
});

gulp.task('files', function() {
	if (!level) {
		fs.writeFileSync('app/components/' + name + '/' + name + '.html','')
		fs.writeFileSync('app/components/' + name + '/' + name + '.scss','')
	} else if (level == 1) {
		fs.writeFileSync('app/components/' + name + '/' + name + '.html','')
		fs.writeFileSync('app/components/' + name + '/' + name + '.sass','')
	} else if (level == 2) {
		fs.writeFileSync('app/components/' + name + '/' + name + '.html','')
		fs.writeFileSync('app/components/' + name + '/' + name + '.scss','')
		fs.writeFileSync('app/components/' + name + '/' + name + '.js','')
	} else if (level == 3) {
		fs.writeFileSync('app/components/' + name + '/' + name + '.html','')
		fs.writeFileSync('app/components/' + name + '/' + name + '.sass','')
		fs.writeFileSync('app/components/' + name + '/' + name + '.js','')
	}
});

gulp.task('make', function() {
  runSequence('folder','files');
});

gulp.task('archive', function() {
    gulp.src('build/**/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('build'))
});

gulp.task('watch', ['clean','browser-sync', 'html', 'style', 'scripts', 'img', 'fonts'], function() {
	gulp.watch([path.watch.htmlApp, path.watch.html], ['html']);
	gulp.watch([path.watch.style], ['style']);
	gulp.watch([path.watch.img], ['img']);
	gulp.watch([path.watch.scripts], ['scripts']);
	gulp.watch([path.watch.fonts], ['fonts']);
});

gulp.task('build', ['clean', 'html', 'deploy:style', 'deploy:scripts', 'img', 'fonts', 'localization']);

gulp.task('deploy', function() {
  runSequence('build','archive');
});

gulp.task('default', ['watch']);
