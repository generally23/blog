// make sure all passed values are try=uthy
exports.validate = (...values) => values.every(value => !!value);

module.exports = exports;