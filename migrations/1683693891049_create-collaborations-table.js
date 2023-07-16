/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },

    playlist_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    user_id: {
      type: 'varchar(50)',
      notNull: true,
    },
  });

  // menambahkan constraint UNIQUE pada kombinasi kolom playlist_id dan user_id
  // agar setiap baris pada table collaboration tidak terdapat duplikasi.
  pgm.addConstraint(
    'collaborations',
    'unique_playlist_id_and_user_id',
    'UNIQUE(playlist_id, user_id)'
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.playlist_id_playlists.id',
    'FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.user_id_users.id',
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('collaborations', 'unique_playlist_id_and_user_id');
  pgm.dropConstraint(
    'collaborations',
    'fk_collaborations.playlist_id_playlists.id'
  );
  pgm.dropConstraint('collaborations', 'fk_collaborations.user_id_users.id');
  pgm.dropTable('collaborations');
};
