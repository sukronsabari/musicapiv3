const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationErorr = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT pl.id, pl.name, users.username
      FROM playlists pl
      LEFT JOIN collaborations clb ON pl.id = clb.playlist_id
      INNER JOIN users ON pl.owner = users.id
      WHERE pl.owner = $1 OR clb.user_id = $1
      GROUP BY pl.id, pl.name, users.username`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    try {
      await this._pool.query('BEGIN');

      // hapus relasi antara playlist dan lagu di junction table
      await this._pool.query(
        'DELETE FROM playlists_songs WHERE playlist_id = $1',
        [id]
      );

      // hapus playlist di table playlists
      await this._pool.query('DELETE FROM playlists WHERE id = $1', [id]);

      await this._pool.query('COMMIT');
    } catch (e) {
      await this._pool.query('ROLLBACK');

      throw new InvariantError('Gagal menghapus playlist');
    }
  }

  async addSongToPlaylist(songId, playlistId) {
    const id = `ps-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan song kedalam playlist');
    }
  }

  async getPlaylistsById(id) {
    const query = {
      text: `SELECT pl.id, pl.name, users.username FROM playlists pl
        INNER JOIN users ON pl.owner = users.id
        WHERE pl.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async getSongsInPlaylist(playlistId) {
    const playlist = await this.getPlaylistsById(playlistId);

    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
        INNER JOIN playlists_songs pls ON songs.id = pls.song_id
        WHERE pls.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    const songs = result.rows || [];

    return {
      playlist: {
        ...playlist,
        songs,
      },
    };
  }

  async deleteSongFromPlaylist(songId, playlistId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError(
        'Gagal menghapus song dari playlists. Song tidak ditemukan di dalam playlist'
      );
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationErorr('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
