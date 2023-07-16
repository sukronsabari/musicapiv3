class AlbumsHandler {
  constructor({ albumsService, songsService, validator, schema }) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._validator = validator;
    this._schema = schema;
  }

  async postAlbumHandler(req, h) {
    this._validator.validatePayloadWithSchema(req.payload, this._schema);

    const { name, year } = req.payload;

    const albumId = await this._albumsService.addAlbum(name, year);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();

    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(req, h) {
    const { id: albumId } = req.params;

    const album = await this._albumsService.getAlbumById(albumId);
    const songs = await this._songsService.getSongsInAlbum(albumId);

    const response = h.response({
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    });

    return response;
  }

  async putAlbumByIdHandler(req, h) {
    // get path parameter
    const { id } = req.params;

    // validate body request
    this._validator.validatePayloadWithSchema(req.payload, this._schema);

    await this._albumsService.editAlbumById(id, req.payload);

    return h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
  }

  async deleteAlbumByIdHandler(req, h) {
    // get path parameter
    const { id } = req.params;

    await this._albumsService.deleteAlbumById(id);

    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
  }
}

module.exports = AlbumsHandler;
