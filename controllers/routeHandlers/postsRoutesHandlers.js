const POSTS = require('./postRouteHandlers/POSTS');

const GETS = require('./postRouteHandlers/GETS');

const UPDATES = require('./postRouteHandlers/UPDATES');

const DELETES = require('./postRouteHandlers/DELETES');

module.exports = {
  ...POSTS,
  ...GETS,
  ...UPDATES,
  ...DELETES
};
