const path = require('path');
const chalk = require('chalk');
const async = require('async');
const _ = require('lodash');
const glob = require('glob');
const Site = require('./site');
const BuildItem = require('./build_item');

/* eslint-disable import/no-dynamic-require, global-require */

/**
 * The build context is used to encapsulate every plugins of kawax. It holds the currently being generated
 * Site and manage plugin calls.
 */
class BuildContext {

  /**
   * Instantiates a new build context with the given options.
   * @param {Object} options Options to use for this building context
   */
  constructor(options) {
    this.plugins = {};
    this.filesProcessed = [];
    this.site = new Site();
    this.workingDir = this.resolve(options.workingDir);
    this.themeDir = this.resolve(options.themeDir || path.join(this.workingDir, '_theme'));
    this.pluginsDir = this.resolve(options.pluginsDir || path.join(this.workingDir, '_plugins'));
    this.outputDir = this.resolve(options.outputDir || path.join(this.workingDir, '_build'));
  }

  /**
   * Simple methods used to make an absolute path from given path.
   * @param {String} fullPath Path to check
   */
  resolve(fullPath) {
    return path.isAbsolute(fullPath) ? fullPath : path.join(process.cwd(), fullPath);
  }

  /**
   * Use the glob method to look for specific files inside the content directory and
   * encapsulate the result into a BuildItem to provide helper methods.
   * @param {String} pattern Pattern to use inside the glob search
   * @param {Function} callback Callback to apply to each file found
   * @param {Function} next Callback to call at the end
   */
  process(pattern, callback, next) {
    glob(pattern, {
      cwd: this.workingDir,
      ignore: ['node_modules/**/*', 'bower_components/**/*', '**/_*', '**/_*/**'],
    }, (err, matches) => {
      if (err) {
        return next(err);
      }

      const items = matches.map(o => new BuildItem(this.workingDir, o));

      return async.each(items, callback, (nerr) => {
        if (nerr) {
          return next(nerr);
        }

        // Keep a list of already processed file, mostly used to copy all non processed files to the
        // output directory at the end
        this.filesProcessed = _.union(this.filesProcessed, items.filter(o => o.processed).map(o => o.filepath));

        return next();
      });
    });
  }

  /**
   * Effectively build the inner site object but don't write anything to the disk yet.
   * @param {Function} next Callback to call once done
   */
  build(next) {
    console.info(`${chalk.green('Launching kawax...')}

    Sources: ${chalk.blue(this.workingDir)}    
    Theme: ${chalk.blue(this.themeDir)}
    Plugins: ${chalk.blue(this.pluginsDir)}
    Output: ${chalk.blue(this.outputDir)}
`);

    this.discoverPlugins((err) => {
      if (err) {
        return next(err);
      }

      console.info(`
${chalk.green('Executing plugins...')}
`);

      return async.each(Object.keys(this.plugins).sort(), (name, cb) => {
        console.info(`Applying ${chalk.blue(name)}`);
        this.plugins[name](this, cb);
      }, next);

      // return async.eachOf(this.plugins, (plugin, name, cb) => {
      //   console.info(`Applying ${chalk.blue(name)}`);
      //   plugin(this, cb);
      // }, next);
    });
  }

  /**
   * Launch the discovery process to load all needed plugins.
   * @param {Function} next Callback to call once done
   */
  discoverPlugins(next) {
    const pluginDirs = [path.join(__dirname, 'plugins'), this.pluginsDir];
    const loadablePlugins = [];
    console.info(`${chalk.green('Discovering plugins in:')}

    ${chalk.blue(pluginDirs.join('\n    '))}
`);

    async.each(pluginDirs, (dir, cb) => {
      glob('**/*.js', { cwd: dir }, (err, matches) => {
        if (err) {
          return cb(err);
        }

        matches.forEach((o) => {
          const requirePath = path.join(dir, o);
          const curPlugin = require(requirePath);

          if (curPlugin.name) {
            // It has a name, register it now
            this.plugins[curPlugin.name] = curPlugin;
            console.info(`Loaded plugin ${chalk.blue(curPlugin.name)}`);
          } else {
            // If it does not have a name, it must be a callback to execute
            loadablePlugins.push(curPlugin);
            console.info(`Registered loadable plugin from ${chalk.blue(requirePath)}`);
          }
        });

        return cb();
      });
    }, (err) => {
      if (err) {
        return next(err);
      }

      loadablePlugins.forEach((p) => {
        // Retrieve the plugin by executing the callback with the current context
        const result = p(this);
        // And then get the result
        this.plugins[result.name] = result;
        console.info(`Loaded loadable plugin ${chalk.blue(result.name)}`);
      });

      return next();
    });
  }

}

module.exports = BuildContext;
