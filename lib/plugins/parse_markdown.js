/**
 * This plugin parse markdown contents.
 * @param {BuildContext} ctx Current building context
 * @param {Function} next Callback to call once done
 */
module.exports = function parseMarkdownContent(ctx, next) {
  ctx.process('**/*.md', (file, cb) => {
    cb();
  }, next);
};
