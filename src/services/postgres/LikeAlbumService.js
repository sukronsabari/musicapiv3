const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class LikeAlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(userId, albumId) {
    await this.verifyLikeRequest(userId, albumId);

    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`album-${albumId}-like-count`);

    if (!result.rows[0].id) {
      throw InvariantError('Gagal menyukai album');
    }
  }

  async verifyLikeRequest(userId, albumId) {
    const query = {
      text: 'SELECT * FROM likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError(
        'Gagal menyukai album kembali. Album sudah anda sukai'
      );
    }
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`album-${albumId}-like-count`);

    if (!result.rows[0].id) {
      throw new InvariantError('Maaf, operasi batal menyukai album gagal');
    }
  }

  async getAlbumLikeCount(albumId) {
    try {
      const likeCount = await this._cacheService.get(
        `album-${albumId}-like-count`
      );
      return {
        fromCache: true,
        likeCount: JSON.parse(likeCount),
      };
    } catch (e) {
      const query = {
        text: 'SELECT COUNT(*) FROM likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likeCount = parseInt(result.rows[0].count) || 0;

      await this._cacheService.set({
        key: `album-${albumId}-like-count`,
        value: JSON.stringify(likeCount),
      });

      return { likeCount };
    }
  }
}

module.exports = LikeAlbumService;
