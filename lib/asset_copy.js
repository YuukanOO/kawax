const fs = require('fs-extra');
const path = require('path');
const async = require('async');

module.exports = function copyAssets(assets, buildDir, themeDir, cb) {
  async.forEachOf(assets, (dest, src, next) => {
    fs.copy(path.join(themeDir, src), path.join(buildDir, dest), next);
  }, cb);
};
