const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (
    server,
    { authenticationsService, validator, schema, usersService, tokenManager }
  ) => {
    const authenticationsHandler = new AuthenticationsHandler({
      authenticationsService,
      validator,
      schema,
      usersService,
      tokenManager,
    });

    server.route(routes(authenticationsHandler));
  },
};
