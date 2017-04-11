module.exports = function (context) {
  return function testing(ctx, next) {
    next();
  };
};
