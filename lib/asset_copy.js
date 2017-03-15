const fs = require('fs-extra');
const path = require('path');
const helpers = require('./helpers');
const async = require('async');
const glob = require('glob');

module.exports = function copyAssets(themeAssets, cwd, buildDir, themeDir, cb) {
  glob(`${cwd}/**/*.*`, helpers.globIgnoreOptionsAssets, (err, matches) => {
    const assets = matches.reduce((prev, cur) =>
       Object.assign({}, prev, {
         [cur]: path.join(buildDir, path.relative(cwd, cur)),
       }), themeAssets);

    async.forEachOf(assets, (dest, src, next) => {
      fs.copy(src, dest, next);
    }, cb);
  });
};
