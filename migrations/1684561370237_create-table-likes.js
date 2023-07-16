/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    album_id: {
      type: 'varchar(50)',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'likes',
    'unique_user_id_and_album_id',
    'UNIQUE(user_id, album_id)'
  );

  pgm.addConstraint(
    'likes',
    'fk_likes.user_id_users.id',
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'likes',
    'fk_likes.album_id_albums.id',
    'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'unique_user_id_and_album_id');
  pgm.dropConstraint('likes', 'fk_likes.user_id_users.id');
  pgm.dropConstraint('likes', 'fk_likes.album_id_albums.id');
  pgm.dropTable('likes');
};
