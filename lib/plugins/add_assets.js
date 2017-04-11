/**
 * This plugin add all valid assets not yet processed to the site assets property.
 * @param {Site} site Current building site
 * @param {Function} next Callback to call once done
 */
module.exports = function addRemainingAssets(site, next) {
  site.glob(site.cwd('**/*.*'), (err, matches) => {
    if (err) {
      return next(err);
    }

    matches.forEach((o) => {
      if (!site.processed(o)) {
        site.addAsset(o, site.output(o));
      }
    });

    return next();
  });
};
