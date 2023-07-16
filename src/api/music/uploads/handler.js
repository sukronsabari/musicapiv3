class UploadAlbumCoverHandler {
  constructor({ storageService, albumsService, validator, schema }) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;
    this._schema = schema;
  }

  async postAlbumCoverHandler(req, h) {
    const { id } = req.params;
    const { cover } = req.payload;

    const meta = cover.hapi;

    // validasi headers (content-type) dari berkas
    this._validator.validatePayloadWithSchema(meta.headers, this._schema);

    const { name, year } = await this._albumsService.getAlbumById(id);

    const filename = await this._storageService.writeFile(cover, meta);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/assets/images/${filename}`;

    await this._albumsService.editAlbumById(id, { name, year, coverUrl });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });

    response.code(201);
    return response;
  }
}

module.exports = UploadAlbumCoverHandler;
