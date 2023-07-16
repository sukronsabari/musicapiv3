const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (req, h) => handler.getPlaylistActivitiesHandler(req, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
];

module.exports = routes;
