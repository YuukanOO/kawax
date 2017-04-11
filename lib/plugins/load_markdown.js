const async = require('async');
const fs = require('fs-extra');
const fm = require('front-matter');
const md = require('markdown').markdown;

/**
 * This plugin loads all markdown data in the content folder and parse them.
 * @param {Site} site Current building site
 * @param {Function} next Callback to call once done
 */
module.exports = function loadMarkdownData(site, next) {
  site.glob(site.cwd('**/*.md'), (err, matches) => {
    if (err) {
      return next(err);
    }

    return async.forEach(matches, (o, cb) => {
      fs.readFile(o, 'utf-8', (ferr, content) => {
        if (ferr) {
          return cb(ferr);
        }

        const meta = fm(content);
        const tree = md.parse(meta.body);

        const pageMeta = Object.assign({}, {
          title: tree.length > 1 ? tree[1][2] : undefined,
          template: 'index.ejs',
        }, meta.attributes);
        const pageContent = md.renderJsonML(md.toHTMLTree(tree));

        site.addPage(o, pageMeta, pageContent);

        return cb();
      });
    }, next);
  });
};
