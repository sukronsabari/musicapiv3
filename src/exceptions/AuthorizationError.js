const ClientError = require('./ClientError');

class AuthorizationErorr extends ClientError {
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationErorr;
