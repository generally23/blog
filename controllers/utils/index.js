// make sure all passed values are try=uthy
exports.validate = (...values) => values.every(value => !!value);

// async catcher. helps to avoid using try catch everywhere
exports.catchAsync = func => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

exports.validateTags = tags => {
  if (typeof tags === 'string') return [tags];
  return tags.filter(tag => typeof tag === 'string' && !!tag);
};

module.exports = exports;
