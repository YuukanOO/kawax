const fs = require('fs-extra');

/**
 * This plugin clean the output directory folder. This is the first step to be called.
 * @param {Site} site Current building site
 * @param {Function} next Callback to call once done
 */
module.exports = function cleanOutputDirectory(site, next) {
  fs.emptyDir(site.options.output, (err) => {
    next(err);
  });
};
