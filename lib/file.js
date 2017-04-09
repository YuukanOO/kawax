const path = require('path');

/**
 * Represents a file being processed that expose some helpers methods
 * to plugins.
 */
class File {

  /**
   * Instantiates a new file for the given absolute path.
   * @param {String} absolutePath Absolute path to this file
   * @param {String} cwd Current working directory
   */
  constructor(absolutePath, cwd) {
    this.absolutePath = absolutePath;
    this.relativePath = path.relative(cwd, absolutePath);
    this.content = null;
  }

}

module.exports = File;