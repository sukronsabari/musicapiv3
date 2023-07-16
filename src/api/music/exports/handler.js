class ExportsHandler {
  constructor({ producerService, playlistsService, validator, schema }) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._schema = schema;
  }

  async postExportPlaylistHandler(req, h) {
    this._validator.validatePayloadWithSchema(req.payload, this._schema);

    const { playlistId } = req.params;
    const { id: credentialId } = req.auth.credentials;
    const { targetEmail } = req.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this._producerService.sendMessageToQueue(
      JSON.stringify(message),
      'export:songsInPlaylist'
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
