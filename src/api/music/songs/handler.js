class SongsHandler {
  constructor(service, validator, schema) {
    this._service = service;
    this._validator = validator;
    this._schema = schema;
  }

  async postSongHandler(req, h) {
    // validate body request
    this._validator.validatePayloadWithSchema(req.payload, this._schema);

    const songId = await this._service.addSong(req.payload);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getSongsHandler(req, h) {
    // get query parameters
    const { title = null, performer = null } = req.query;

    const songs = await this._service.getSongs({ title, performer });

    return h.response({
      status: 'success',
      data: {
        songs,
      },
    });
  }

  async getSongByIdHandler(req, h) {
    // get path parameter
    const { id } = req.params;

    const song = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });

    return response;
  }

  async putSongByIdHandler(req, h) {
    // get path parameter
    const { id } = req.params;

    // validate body request
    this._validator.validatePayloadWithSchema(req.payload, this._schema);

    await this._service.editSongById(id, req.payload);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil diperbarui',
    });

    return response;
  }

  async deleteSongByIdHandler(req, h) {
    // get path parameters
    const { id } = req.params;

    await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil dihapus',
    });

    return response;
  }
}

module.exports = SongsHandler;
