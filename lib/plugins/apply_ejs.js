const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs');

const compiledTemplates = {};

/**
 * This plugin applies EJS templates.
 * @param {BuildContext} ctx Current building context
 * @param {Function} next Callback to call once done
 */
module.exports = function _30_applyEJSTemplates(ctx, next) {
  ctx.site.pages.forEach((page) => {
    let templatePath = path.join(ctx.themeDir, page.meta.template || 'index.ejs');

    // Add extension if needed
    if (!path.extname(templatePath)) {
      templatePath += '.ejs';
    }

    let tmpl = compiledTemplates[templatePath];

    if (!tmpl) {
      tmpl = ejs.compile(fs.readFileSync(templatePath, 'utf-8'), {
        filename: templatePath,
      });
      compiledTemplates[templatePath] = tmpl;
    }

    const templateData = Object.assign({}, ctx.site.data, {
      page,
      pages: ctx.site.pages,
      copy: (src, dest) => {
        ctx.site.addAsset(path.resolve(ctx.themeDir, src), path.join(ctx.outputDir, dest));
      },
    });

    page.content = tmpl(templateData);
  });

  return next();
};
