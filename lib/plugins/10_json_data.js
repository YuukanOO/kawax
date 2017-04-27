/**
 * This plugin parse and load json data inside the website.
 * @param {BuildContext} ctx Current building context
 * @param {Function} next Callback to call once done
 */
module.exports = function parseJsonData(ctx, next) {
  ctx.process('**/*.json', (file, cb) => {
    file.readJson((err, content) => {
      if (err) {
        return cb(err);
      }

      ctx.site.addData(file.segments(), content);

      file.hasBeenProcessed();

      return cb();
    });
  }, next);
};
