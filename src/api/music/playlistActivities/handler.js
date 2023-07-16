const { Pool } = require('pg');

class PlaylistActivitiesHandler {
  constructor(playlistActivitiesService, playlistsService) {
    this._pool = new Pool();
    this._playlistActivitiesService = playlistActivitiesService;
    this._playlistsService = playlistsService;
  }

  async getPlaylistActivitiesHandler(req) {
    const { id: playlistId } = req.params;
    const { id: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const activities = await this._playlistActivitiesService.getActivities(
      playlistId
    );

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistActivitiesHandler;
