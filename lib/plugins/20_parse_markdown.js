const fm = require('front-matter');
const md = require('markdown').markdown;

/**
 * This plugin parse markdown contents.
 * @param {BuildContext} ctx Current building context
 * @param {Function} next Callback to call once done
 */
module.exports = function parseMarkdownContent(ctx, next) {
  ctx.process('**/*.md', (file, cb) => {
    file.readFile((err, content) => {
      if (err) {
        return cb(err);
      }

      const rawMeta = fm(content);
      const tree = md.parse(rawMeta.body);

      // Here, we try to retrieve the title by looking at the first md element
      const meta = Object.assign({}, {
        title: tree.length > 1 ? tree[1][2] : undefined,
      }, file.pageMeta(), rawMeta.attributes);
      const htmlContent = md.renderJsonML(md.toHTMLTree(tree));

      ctx.site.addPage(meta, htmlContent);

      file.hasBeenProcessed();

      return cb();
    });
  }, next);
};
