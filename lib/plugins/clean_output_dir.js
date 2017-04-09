const fs = require('fs-extra');

/**
 * This plugin clean the output directory folder. This is the first step to be called.
 */
module.exports = function cleanOutputDirectory(site, next) {
  fs.emptyDir(site.options.output, (err) => {
    next(err);
  });
};
