const ejs = require('ejs');
const fs = require('fs-extra');
const async = require('async');
const path = require('path');

const templates = {};

/**
 * This plugin process each file with a content and a template meta sets with EJS.
 * @param {Site} site Current building site
 * @param {Function} next Callback to call once done
 */
module.exports = function processEJS(site, next) {
  async.each(site.pages, (page, cb) => {
    if (!page.meta.template) {
      return cb();
    }

    const templatePath = site.template(page.meta.template, 'ejs');

    let compiledTemplate = templates[templatePath];

    // If the template has not been compiled already, do it now
    if (!compiledTemplate) {
      compiledTemplate = ejs.compile(fs.readFileSync(templatePath, 'utf-8'), {
        filename: templatePath,
      });
      templates[templatePath] = compiledTemplate;
    }

    const templateData = Object.assign({}, site.data, {
      page,
      pages: Object.values(site.pages),
      copy: (src, dest) => {
        site.addAsset(path.join(site.options.theme, src), path.join(site.options.output, dest));
        return dest;
      },
    });

    page.content = compiledTemplate(templateData);

    return cb();
  }, next);
};
