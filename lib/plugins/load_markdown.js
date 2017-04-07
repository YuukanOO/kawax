/**
 * This plugin loads all markdown data in the content folder and parse them.
 */
module.exports = function loadMarkdownData(site, next) {
  site.glob(site.cwd('**/**.md'), (err, matches) => {
    if (err) {
      return next(err);
    }

    matches.forEach((o) => {
      site.process(o, () => {

      });
    });

    return next();
  });
};
