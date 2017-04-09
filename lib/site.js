const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const async = require('async');
const log = require('./log');
const File = require('./file');

/* eslint-disable global-require */

/**
 * Represents the site we are actually trying to build.
 * @class Site
 */
class Site {

  /**
   * Instantiates a new Site with given options.
   * @param {{ working: String, theme: String, output: String, plugins: String }} options Options to use when generating
   */
  constructor(options) {
    this.options = this.makeAbsolutePaths(options);
    this.processedFiles = {};
    this.data = {};
    this.plugins = [
      require('./plugins/clean_output_dir'),
      require('./plugins/load_data'),
      require('./plugins/load_markdown'),
    ];
  }

  /**
   * Make absolute paths for all site settings.
   * @param {Object} opts Base options to use.
   */
  makeAbsolutePaths(opts) {
    const cwd = this.toCwdAbsolutePath(opts.working);
    return {
      working: cwd,
      theme: this.toCwdAbsolutePath(opts.theme || path.join(cwd, '_theme')),
      plugins: this.toCwdAbsolutePath(opts.plugins || path.join(cwd, '_plugins')),
      output: this.toCwdAbsolutePath(opts.output || path.join(cwd, '_build')),
    };
  }

  /**
   * Make a path absolute by expanding it using the current working directory.
   * @param {String} str Base string to check
   */
  toCwdAbsolutePath(str) {
    return path.isAbsolute(str) ? str : path.join(process.cwd(), str);
  }

  /**
   * Generates this site right now!
   * @param {Function} cb Callback which will be called when done.
   */
  generate(cb) {
    log.info(`
    Working directory: ${chalk.blue(this.options.working)}
    Theme directory: ${chalk.blue(this.options.theme)}
    Plugins directory: ${chalk.blue(this.options.plugins)}
    Output directory: ${chalk.blue(this.options.output)}
`);

    this.discoverPlugins((err) => {
      if (err) {
        return cb(err);
      }

      return async.waterfall(this.plugins.map(o => this.wrapPluginCall(o)), cb);
    });
  }

  /**
   * Wrap the plugin call to log its name during build phase.
   * @param {Function} plugin Plugin method to call
   */
  wrapPluginCall(plugin) {
    return (next) => {
      log.info(`Running plugin ${chalk.blue(plugin.name)}`);
      return plugin(this, next);
    };
  }

  /**
   * Find files in any directory and add default ignore options.
   * @param {String} pattern Pattern to match
   * @param {Function} matches Function that will receive matched files
   */
  glob(pattern, matches, options = { ignore: ['**/_*', '**/_*/**'] }) {
    return glob(pattern, options, matches);
  }

  /**
   * Append given relative path to the current working directory.
   */
  cwd(relPath) {
    return path.join(this.options.working, relPath);
  }

  /**
   * Process a file using the given delegate. Upon completion, it will mark the
   * file as processed.
   * @param {String} filePath Absolute path to the file
   * @param {Function} delg Delegate to call to process the file
   */
  process(filePath, delg) {
    let file = this.processedFiles[filePath];

    if (!file) {
      file = new File(filePath, this.options.working);
      this.processedFiles[filePath] = file;
    }

    log.info(`Processing ${chalk.blue(file.relativePath)}...`);

    delg(file);
  }

  /**
   * Discover and load plugins in the plugin directory.
   * @param {Function} cb Callback which will be called when done.
   */
  discoverPlugins(cb) {
    log.info('Discovering plugins...');
    this.glob(`${this.options.working}/**/*.js`, (err, matches) => {
      if (err) {
        return cb(err);
      }

      log.info(`Found ${chalk.blue(matches.length)} plugin(s)`);

      // eslint-disable-next-line import/no-dynamic-require
      this.plugins = this.plugins.concat(matches.map(o => require(o)));

      log.info(`All plugins discovered and loaded!
That's a total of ${chalk.blue(this.plugins.length)} plugins (including default ones)`);

      return cb();
    }, {}); // By pass ignore options here since _plugins has an underscore
  }
}

module.exports = Site;
