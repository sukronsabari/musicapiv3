class PlaylistsHandler {
  constructor({
    playlistsService,
    songsService,
    playlistActivitiesService,
    validator,
    schema,
  }) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._validator = validator;
    this._schema = schema;
  }

  async postPlaylistHandler(req, h) {
    this._validator.validatePayloadWithSchema(
      req.payload,
      this._schema.PostPlaylistPayloadSchema
    );

    const { name } = req.payload;

    // get user credential
    const { id: credentialId } = req.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist(
      name,
      credentialId
    );

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan playlist baru',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(req) {
    const { id: credentialId } = req.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(req) {
    const { id } = req.params;
    const { id: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistUsingPlaylistIdHandler(req, h) {
    this._validator.validatePayloadWithSchema(
      req.payload,
      this._schema.PostSongToPlaylistPayloadSchema
    );

    const { songId } = req.payload;
    const { id: playlistId } = req.params;
    const { id: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.getSongById(songId);

    await this._playlistsService.addSongToPlaylist(songId, playlistId);

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId: credentialId,
      action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu ke dalam playlist',
    });

    response.code(201);
    return response;
  }

  async getSongsInPlaylistUsingPlaylistIdHandler(req) {
    const { id: playlistId } = req.params;
    const { id: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistsService.getSongsInPlaylist(
      playlistId
    );

    return {
      status: 'success',
      data: {
        ...playlist,
      },
    };
  }

  async deleteSongFromPlaylistUsingPlaylistIdHandler(req) {
    this._validator.validatePayloadWithSchema(
      req.payload,
      this._schema.DeleteSongFromPlaylistPayloadSchema
    );

    const { songId } = req.payload;
    const { id: playlistId } = req.params;
    const { id: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsService.deleteSongFromPlaylist(songId, playlistId);

    await this._playlistActivitiesService.addActivity({
      playlistId,
      songId,
      userId: credentialId,
      action: 'delete',
    });

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
