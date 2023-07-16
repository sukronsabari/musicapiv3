const UploadAlbumCoverHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (
    server,
    { storageService, albumsService, validator, schema }
  ) => {
    const uploadAlbumCoverHandle = new UploadAlbumCoverHandler({
      storageService,
      albumsService,
      validator,
      schema,
    });

    server.route(routes(uploadAlbumCoverHandle));
  },
};
