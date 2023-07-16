const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: '_exports',
  version: '1.0.0',
  register: async (
    server,
    { producerService, playlistsService, validator, schema }
  ) => {
    const exportsHandler = new ExportsHandler({
      producerService,
      playlistsService,
      validator,
      schema,
    });

    server.route(routes(exportsHandler));
  },
};
