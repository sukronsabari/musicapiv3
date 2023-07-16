/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addColumns('albums', {
    cover_url: {
      type: 'text',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', 'cover_url');
};
