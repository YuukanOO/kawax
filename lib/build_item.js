const fs = require('fs-extra');
const path = require('path');

/**
 * Represents a single file being processed that exposes multiple helper
 * methods to deal with its content.
 */
class BuildItem {

  /**
   * Instantiates a new BuildItem for the given filepath.
   * @param {String} cwd Current working directory
   * @param {String} filepath Source filepath
   */
  constructor(cwd, filepath) {
    this.relativePath = filepath;
    this.filepath = path.join(cwd, filepath);
  }

  segments() {
    return this.relativePath.replace(path.extname(this.relativePath), '').split('/');
  }

  readJson(cb) {
    return fs.readJson(this.filepath, cb);
  }

  readFile(cb) {
    return fs.readFile(this.filepath, 'utf-8', cb);
  }

}

module.exports = BuildItem;
