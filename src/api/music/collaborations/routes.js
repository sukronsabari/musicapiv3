const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: (req, h) => handler.postCollaborationHandler(req, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: (req, h) => handler.deleteCollaborationHandler(req, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
];

module.exports = routes;
