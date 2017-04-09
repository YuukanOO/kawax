const path = require('path');
const fs = require('fs-extra');

/**
 * This plugin loads all json data in the content folder and keep the parsed
 * result inside site.data.
 * @param {Site} site Current building site
 * @param {Function} next Callback to call once done
 */
module.exports = function loadJsonData(site, next) {
  site.glob(site.cwd('**/*.json'), (err, matches) => {
    if (err) {
      return next(err);
    }

    matches.forEach((o) => {
      site.process(o, (file) => {
        const parts = file.path.split(path.sep);

        let curData = site.data;

        for (let i = 0; i < parts.length; i += 1) {
          if (i === parts.length - 1) {
            curData[parts[i]] = fs.readJsonSync(o);
          } else {
            curData[parts[i]] = {};
          }

          curData = curData[parts[i]];
        }
      });
    });

    return next();
  });
};
