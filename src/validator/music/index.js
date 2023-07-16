const InvariantError = require('../../exceptions/InvariantError');

class MusicValidator {
  static validatePayloadWithSchema(payload, schema) {
    const validatonResult = schema.validate(payload);

    if (validatonResult.error) {
      throw new InvariantError(validatonResult.error.message);
    }
  }
}

module.exports = MusicValidator;
