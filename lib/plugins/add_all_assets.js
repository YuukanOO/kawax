const path = require('path');

/**
 * This plugin applies EJS templates.
 * @param {BuildContext} ctx Current building context
 * @param {Function} next Callback to call once done
 */
module.exports = function _90_addAllAssets(ctx, next) {
  ctx.process('**/*.*', (file, cb) => {
    if (file.processed) {
      return cb();
    }

    ctx.site.addAsset(file.filepath, path.join(ctx.outputDir, file.relativePath));

    return cb();
  }, next);
};
