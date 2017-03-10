const async = require('async');
const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const helpers = require('./helpers');

const templates = {};

module.exports = function outputFiles(data, pages, buildDir, themeDir, cb) {
  async.each(pages, (page, next) => {
    const templatePath = path.join(themeDir, helpers.addExtensionIfNeeded(page.template, 'ejs'));

    let compiledTemplate = templates[templatePath];

    if (!compiledTemplate) {
      compiledTemplate = ejs.compile(fs.readFileSync(templatePath, 'utf-8'), {
        filename: templatePath,
      });
      templates[templatePath] = compiledTemplate;
    }

    const templateData = Object.assign({}, data, {
      page,
      pages,
    });

    fs.outputFile(path.join(buildDir, page._build.destRelative),
      compiledTemplate(templateData), next);
  }, cb);
};
