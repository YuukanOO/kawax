const BuildContext = require('./build_context');

/**
 * Entry point of this static site generator.
 */
module.exports = function generate(options, next) {
  new BuildContext(options).build(next);
};
