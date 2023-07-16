class AuthenticationsService {
  constructor({
    authenticationsService,
    validator,
    schema,
    usersService,
    tokenManager,
  }) {
    this._authenticationsService = authenticationsService;
    this._validator = validator;
    this._schema = schema;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
  }

  async postAuthenticationHandler(req, h) {
    this._validator.validatePayloadWithSchema(
      req.payload,
      this._schema.PostAuthenticationPayloadSchema
    );

    const { username, password } = req.payload;

    const id = await this._usersService.verifyUserCredential(
      username,
      password
    );

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    // save refresh token to db
    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthenticationHandler(req) {
    this._validator.validatePayloadWithSchema(
      req.payload,
      this._schema.PutAuthenticationPayloadSchema
    );

    const { refreshToken } = req.payload;

    // verify refresh token in db
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    // verify refresh token signature dan ambil id user dari payload token
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(req) {
    this._validator.validatePayloadWithSchema(
      req.payload,
      this._schema.DeleteAuthenticationPayloadSchema
    );

    const { refreshToken } = req.payload;

    // verify refresh token in db
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsService;
