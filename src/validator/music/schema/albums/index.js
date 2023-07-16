const Joi = require('joi');

const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().trim().required(),
  year: Joi.number().integer().required(),
});

module.exports = AlbumsPayloadSchema;
