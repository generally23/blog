const POSTS = require('./commentRouteHandlers/POSTS');
const GETS = require('./commentRouteHandlers/GETS');
const UPDATES = require('./commentRouteHandlers/UPDATES');
const DELETES = require('./commentRouteHandlers/DELETES');

module.exports = {
  ...POSTS,
  ...GETS,
  ...UPDATES,
  ...DELETES
};
