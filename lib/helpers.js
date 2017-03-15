const path = require('path');

/**
 * Generates an absolute path if the one provided is not already one.
 * @param {string} str Path to check
 * @returns {string} Absolute path
 */
function generateAbsolute(str) {
  return path.isAbsolute(str) ? str : path.join(process.cwd(), str);
}

/**
 * Adds the given extension if needed.
 * @param {string} str Filename or path
 * @param {string} ext Extension to add (does not include the period)
 */
function addExtensionIfNeeded(str, ext) {
  return !path.extname(str) ? `${str}.${ext}` : str;
}

const globIgnoreOptions = { ignore: ['**/_*', '**/_*/**'] };
const dataExtension = '.json';
const pageExtension = '.md';

module.exports = {
  generateAbsolute,
  addExtensionIfNeeded,
  globIgnoreOptions, // Global ignore opts for glob
  dataExtension,
  pageExtension,
  globIgnoreOptionsAssets: {
    ignore: globIgnoreOptions.ignore.concat([`**/*${dataExtension}`, `**/*${pageExtension}`]),
  },
};
