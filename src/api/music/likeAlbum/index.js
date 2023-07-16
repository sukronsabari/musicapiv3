const LikeAlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likeAlbum',
  version: '1.0.0',
  register: async (server, { likeAlbumService, albumsService }) => {
    const likeAlbumHandler = new LikeAlbumHandler(
      likeAlbumService,
      albumsService
    );

    server.route(routes(likeAlbumHandler));
  },
};
