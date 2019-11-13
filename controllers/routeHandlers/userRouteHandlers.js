const POSTS = require('./userRouteHandlers/POSTS');
const GETS = require('./userRouteHandlers/GETS');
const UPDATES = require('./userRouteHandlers/UPDATES');
const DELETES = require('./userRouteHandlers/DELETES');

module.exports = {
  ...POSTS,
  ...GETS,
  ...UPDATES,
  ...DELETES
};
