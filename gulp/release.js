/* global process */
// This file contains all release related tasks.

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const config = require('./config');
const fs = require('fs');
const path = require('path');

gulp.task('copyReleaseAssets', function copyReleaseAssets() {
  return gulp.src(config.PATHS.releaseAssets)
    .pipe(gulp.dest(config.PATHS.dist.base));
});

gulp.task('changelog', function changelog() {
  return gulp.src('CHANGELOG.md', {
    buffer: false,
  })
    .pipe($.conventionalChangelog({
      preset: 'angular',
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('createPackageJson', function createPackageJson() {
  const basePkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

  // remove scripts
  delete basePkgJson.scripts;

  // remove devDependencies (as there are important for the sourcecode only)
  delete basePkgJson.devDependencies;

  const filepath = path.join(__dirname, '../dist/package.json');
  fs.writeFileSync(filepath, JSON.stringify(basePkgJson, null, 2), 'utf-8');
});

gulp.task('create-tag', function createTag(cb) {
  function getPackageJsonVersion() {
    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
  }

  const version = getPackageJsonVersion();
  $.git.tag(version, 'chore(version): ' + version, function createGitTag(error) {
    if (error) {
      return cb(error);
    }
  });
});
