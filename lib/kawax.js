const chalk = require('chalk');
const pkg = require('./../package.json');
const log = require('./log');
const Site = require('./site');

/**
 * Generates a static site given a working directory.
 *
 * @param {{ working: String, theme: String, output: String, plugins: String }} options Options to use when generating
 * @param {Function} cb Callback to call once done
 */
module.exports = function generate(options, cb) {
  log.info('Launching', chalk.bold.green(`${pkg.name} v${pkg.version}`), '...');

  new Site(options).generate(cb);
};
