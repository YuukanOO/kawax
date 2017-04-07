/**
 * This plugin loads all json data in the content folder and keep the parsed
 * result inside site.data.
 */
module.exports = function loadJsonData(site, next) {
  site.glob(site.cwd('**/**.json'), (err, matches) => {
    if (err) {
      return next(err);
    }

    matches.forEach((o) => {
      site.process(o, () => {

      });
    });

    return next();
  });

  // glob(`${cwd}/**/*${helpers.dataExtension}`, helpers.globIgnoreOptions, (err, matches) => {
  //   if (err) {
  //     return cb(err);
  //   }

  //   const data = {};

  //   matches.forEach((o) => {
  //     const relativeFilepath = path.relative(cwd, o);
  //     const completePath = relativeFilepath.replace(path.extname(relativeFilepath), '');
  //     const parts = completePath.split(path.sep);

  //     let curData = data;

  //     for (let i = 0; i < parts.length; i += 1) {
  //       if (i === parts.length - 1) {
  //         curData[parts[i]] = fs.readJsonSync(o);
  //       } else {
  //         curData[parts[i]] = {};
  //       }

  //       curData = curData[parts[i]];
  //     }
  //   });

  //   return cb(null, data);
  // });

  // next();
};
