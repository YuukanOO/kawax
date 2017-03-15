const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');
const helpers = require('./helpers');

/**
 * Load all data and keeps the directory structure.
 * @param {string} cwd Working directory to use
 * @param {Function} cb Callback to call once done
 */
module.exports = function loadData(cwd, cb) {
  glob(`${cwd}/**/*${helpers.dataExtension}`, helpers.globIgnoreOptions, (err, matches) => {
    if (err) {
      return cb(err);
    }

    const data = {};

    matches.forEach((o) => {
      const relativeFilepath = path.relative(cwd, o);
      const completePath = relativeFilepath.replace(path.extname(relativeFilepath), '');
      const parts = completePath.split(path.sep);

      let curData = data;

      for (let i = 0; i < parts.length; i += 1) {
        if (i === parts.length - 1) {
          curData[parts[i]] = fs.readJsonSync(o);
        } else {
          curData[parts[i]] = {};
        }

        curData = curData[parts[i]];
      }
    });

    return cb(null, data);
  });
};
