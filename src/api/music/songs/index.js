const routes = require('./routes');
const SongsHandler = require('./handler');

module.exports = {
  name: 'song',
  version: '1.0.0',
  register: async (server, { service, validator, schema }) => {
    const songsHandler = new SongsHandler(service, validator, schema);

    server.route(routes(songsHandler));
  },
};
