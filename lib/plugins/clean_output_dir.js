const fs = require('fs-extra');

/**
 * This plugin ensures the output directory is empty.
 * @param {BuildContext} ctx Current building context
 * @param {Function} next Callback to call once done
 */
module.exports = function _00_cleanOutputDir(ctx, next) {
  fs.emptyDir(ctx.outputDir, (err) => {
    if (err) {
      return next(err);
    }

    return next();
  });
};
