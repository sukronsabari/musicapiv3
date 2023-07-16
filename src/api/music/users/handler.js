class UsersHandler {
  constructor({ service, validator, schema }) {
    this._service = service;
    this._validator = validator;
    this._schema = schema;
  }

  async postUserHandler(req, h) {
    this._validator.validatePayloadWithSchema(req.payload, this._schema);

    const { username, password, fullname } = req.payload;

    const userId = await this._service.addUser({
      username,
      password,
      fullname,
    });

    const response = h.response({
      status: 'success',
      data: {
        userId,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
