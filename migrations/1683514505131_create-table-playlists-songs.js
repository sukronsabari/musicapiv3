/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('playlists_songs', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    song_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    playlist_id: {
      type: 'varchar(50)',
      notNull: true,
    },
  });

  // menambahkan constraint UNIQUE pada kombinasi kolom song_id dan playlist_id
  // agar setiap baris pada table playlists_songs tidak terdapat duplikasi
  pgm.addConstraint(
    'playlists_songs',
    'unique_song_id_and_playlist_id',
    'UNIQUE(song_id, playlist_id)'
  );

  // menambahkan foreign key constraint pada kolom song_id dan playlist_id
  pgm.addConstraint(
    'playlists_songs',
    'fk_playlists_songs.song_id_songs.id',
    'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'playlists_songs',
    'fk_playlists_songs.playlist_id_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists_songs', 'unique_song_id_and_playlist_id');
  pgm.dropConstraint('playlists_songs', 'fk_playlists_songs.song_id_songs.id');
  pgm.dropConstraint(
    'playlists_songs',
    'fk_playlists_songs.playlist_id_playlists.id'
  );
  pgm.dropTable('playlists_songs');
};
