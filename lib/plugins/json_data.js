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

      let data = ctx.site.data;
      const segments = file.segments();

      segments.forEach((d, i) => {
        if (!data[d]) {
          data[d] = {};
        }

        // If last segment, merge file content
        if (i === segments.length - 1) {
          data[d] = Object.assign({}, data[d], content);
        }

        data = data[d];
      });

      file.hasBeenProcessed();

      return cb();
    });
  }, next);
};
