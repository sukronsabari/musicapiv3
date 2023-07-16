const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (
    server,
    {
      playlistsService,
      songsService,
      playlistActivitiesService,
      validator,
      schema,
    }
  ) => {
    const playlistsHandler = new PlaylistsHandler({
      playlistsService,
      songsService,
      playlistActivitiesService,
      validator,
      schema,
    });

    server.route(routes(playlistsHandler));
  },
};
