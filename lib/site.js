const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const async = require('async');
const fs = require('fs-extra');
const log = require('./log');

/* eslint-disable global-require */

const DEFAULT_IGNORE_OPTS = [
  '**/_*',
  '**/_*/**',
  '**/node_modules/**/*',
  '**/bower_components/**/*',
];

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
    this.data = {};
    this.assets = {};
    this.pages = {};
    this.plugins = [
      require('./plugins/clean_output_dir'),
      require('./plugins/load_data'),
      require('./plugins/load_markdown'),
      require('./plugins/process_ejs'),
      require('./plugins/add_assets'),
    ];
  }

  /**
   * Checks if the given path has already been processed.
   * @param {String} fullPath Full path to the file
   */
  processed(fullPath) {
    return this.assets[fullPath] !== undefined
      || this.pages[fullPath] !== undefined
      || this.data[fullPath] !== undefined;
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

      return async.waterfall(this.plugins.map(o => this.wrapPluginCall(o)).concat([
        next => async.eachOf(this.pages, (p, src, pcb) => fs.outputFile(this.output(src), p.content, pcb), next),
        next => async.eachOf(this.assets, (dest, src, pcb) => fs.copy(src, dest, pcb), next),
      ]), cb);
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
  glob(pattern, matches, options = { ignore: DEFAULT_IGNORE_OPTS }) {
    return glob(pattern, options, matches);
  }

  /**
   * Append given relative path to the current working directory.
   * @param {String} relPath Relative path to append
   */
  cwd(relPath) {
    return path.join(this.options.working, relPath);
  }

  /**
   * Append given relative path to the theme directory and ensure ext is present.
   * @param {String} relPath Relative path to append
   * @param {String} ext Extension to ensure
   */
  template(relPath, ext) {
    return path.join(this.options.theme, (!path.extname(relPath) ? `${relPath}.${ext}` : relPath));
  }

  /**
   * Returns a path relative to the current working directory of this site.
   * @param {String} fullPath Full path to a resource
   */
  relative(fullPath) {
    return path.relative(this.options.working, fullPath);
  }

  /**
   * Returns a path without a file extension.
   * @param {String} fullPath Full path to a resource
   */
  withoutExtension(fullPath) {
    return fullPath.replace(path.extname(fullPath), '');
  }

  /**
   * Returns an output path for the given resource.
   * @param {String} fullPath Full path to a resource
   */
  output(fullPath) {
    // If not a page, constructs the output path
    if (!this.pages[fullPath]) {
      return path.join(this.options.output, this.relative(fullPath));
    }

    const relWithoutExt = this.withoutExtension(this.relative(fullPath));

    // If named index, do not append /index
    if (path.basename(relWithoutExt) === 'index') {
      return path.join(this.options.output, `${relWithoutExt}.html`);
    }

    return path.join(this.options.output, relWithoutExt, 'index.html');
  }

  /**
   * Returns an URI for the given resource.
   * @param {String} fullPath Full path to a resource
   */
  uri(fullPath) {
    return path.join('/', this.withoutExtension(this.relative(fullPath))).replace(/\\/g, '/');
  }

  /**
   * Add a page that should be outputed at the end.
   * @param {String} src Source file
   * @param {Object} meta Meta object for this page
   * @param {Mixed} content Content of this page
   */
  addPage(src, meta, content) {
    const existed = this.assets[src] !== undefined;
    this.pages[src] = {
      path: this.uri(src),
      meta,
      content,
    };

    if (!existed) {
      log.info(`Added page ${chalk.blue(this.relative(src))}`);
    }
  }

  addData(src, data) {
    const existed = this.data[src] !== undefined;
    this.data[src] = data;

    if (!existed) {
      log.info(`Added data from ${chalk.blue(this.relative(src))}`);
    }
  }

  /**
   * Adds an asset to be processed (ie. copied) into the build dir.
   * @param {String} src Absolute path to the source file
   * @param {String} dest Absolute path to the destination file
   */
  addAsset(src, dest) {
    const existed = this.assets[src] !== undefined;
    this.assets[src] = dest;

    if (!existed) {
      log.info(`Added asset ${chalk.blue(this.relative(src))} -> ${chalk.blue(this.relative(dest))}`);
    }
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
