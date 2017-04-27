/**
 * This plugin applies EJS templates.
 * @param {BuildContext} ctx Current building context
 * @param {Function} next Callback to call once done
 */
module.exports = function _30_applyEJSTemplates(ctx, next) {
  ctx.site.pages.forEach((page) => {
    console.log(page.meta.title);
  });

  return next();
};
