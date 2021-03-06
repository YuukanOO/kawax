const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const helpers = require('./helpers');
const loadData = require('./data_loader');
const loadFiles = require('./file_loader');
const outputFiles = require('./file_output');
const copyAssets = require('./asset_copy.js');

/**
 * Generates a static site given a working directory.
 *
 * @param {string|Object} dir Working directory to use or an object with working, theme, output.
 * @param {Function} cb Callback to call once done
 */
module.exports = function generate(dir, cb) {
  let dirObj = dir;

  if (typeof dir !== 'object') {
    dirObj = { working: dir };
  }

  const workingDir = helpers.generateAbsolute(dirObj.working);
  const buildDir = helpers.generateAbsolute(dirObj.output || path.join(workingDir, '_build'));
  const themeDir = helpers.generateAbsolute(dirObj.theme || path.join(workingDir, '_theme'));

  fs.exists(workingDir, (exists) => {
    if (!exists) {
      return cb('Directory does not exists');
    }

    console.info(`Processing folder: ${workingDir}
Output will be put to: ${buildDir}
Templates will be searched in: ${themeDir}`);

    return async.waterfall([
      ec => fs.emptyDir(buildDir, ec),
      (o, dc) => loadData(workingDir, dc || o), // Sometimes there multiple arguments
      (data, fc) => loadFiles(data, workingDir, fc),
      (data, pages, oc) => outputFiles(data, pages, buildDir, themeDir, oc),
      (assets, ac) => copyAssets(assets, workingDir, buildDir, themeDir, ac),
    ], cb);
  });
};
