const glob = require('glob');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const fm = require('front-matter');
const md = require('markdown').markdown;
const helpers = require('./helpers');

/**
 * Load all pages, read front matter, parse markdown and computes output path.
 * @param {Object} data Site data
 * @param {string} cwd Working directory
 * @param {Function} cb Callback to call once done
 */
module.exports = function loadFiles(data, cwd, cb) {
  const pages = [];

  glob(`${cwd}/**/*${helpers.pageExtension}`, helpers.globIgnoreOptions, (err, matches) => {
    if (err) {
      return cb(err);
    }

    return async.each(matches, (src, icb) => {
      const srcRelative = path.relative(cwd, src);
      const relativeDir = srcRelative.replace(path.basename(srcRelative), '');
      const pagePath = path.join(relativeDir, path.basename(src, path.extname(src)));
      const destRelative = path.join(pagePath, 'index.html');

      fs.readFile(src, 'utf-8', (ferr, fileContent) => {
        if (ferr) {
          return icb(ferr);
        }

        const meta = fm(fileContent);
        const tree = md.parse(meta.body);
        const content = md.renderJsonML(md.toHTMLTree(tree));

        pages.push(Object.assign({}, {
          title: (tree.length > 1 ? tree[1][2] : undefined),
          path: path.join('/', pagePath).replace(/\\/g, '/'),
          template: 'index.ejs',
          content,
          _build: {
            src,
            srcRelative,
            destRelative,
          },
        }, meta.attributes));

        return icb();
      });
    }, aerr => cb(aerr, data, pages));
  });
};
