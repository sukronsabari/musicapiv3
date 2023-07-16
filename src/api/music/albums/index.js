const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (
    server,
    { albumsService, songsService, validator, schema }
  ) => {
    const albumHandler = new AlbumsHandler({
      albumsService,
      songsService,
      validator,
      schema,
    });

    server.route(routes(albumHandler));
  },
};
