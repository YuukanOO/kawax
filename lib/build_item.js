const fs = require('fs-extra');
const path = require('path');

/**
 * Represents a single file being processed that exposes multiple helper
 * methods to deal with its content.
 */
class BuildItem {

  /**
   * Instantiates a new BuildItem for the given filepath.
   * @param {Object} ctx Current building context
   * @param {String} filepath Source filepath
   */
  constructor(ctx, filepath) {
    this.relativePath = filepath;
    this.filepath = path.join(ctx.workingDir, filepath);
    this.processed = (ctx.filesProcessed.indexOf(this.filepath) !== -1);
  }

  /**
   * Retrieve path segments.
   * @return {Array} Parts of the path
   */
  segments() {
    return this.path().split('/');
  }

  /**
   * Retrieve the relative path of the file without its extension.
   * @return {String} The destination path
   */
  path() {
    return this.relativePath.replace(path.extname(this.relativePath), '');
  }

  /**
   * Retrieve page meta.
   * @return {Object} Page meta related to path
   */
  pageMeta() {
    return {
      path: this.path(),
      source: this.filepath,
    };
  }

  readJson(cb) {
    return fs.readJson(this.filepath, cb);
  }

  readFile(cb) {
    return fs.readFile(this.filepath, 'utf-8', cb);
  }

  hasBeenProcessed() {
    this.processed = true;
  }

}

module.exports = BuildItem;
