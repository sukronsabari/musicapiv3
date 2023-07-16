/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require('dotenv').config();

const path = require('node:path');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

// albums
const albums = require('./api/music/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsPayloadSchema = require('./validator/music/schema/albums');

// songs
const songs = require('./api/music/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsPayloadSchema = require('./validator/music/schema/songs');

// users
const users = require('./api/music/users');
const UsersService = require('./services/postgres/UsersService');
const UsersPayloadSchema = require('./validator/music/schema/users');

// authentications
const authentications = require('./api/music/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./validator/music/schema/authentications');
const TokenManager = require('./tokenize/TokenManager');

// playlists
const playlists = require('./api/music/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
} = require('./validator/music/schema/playlists');

// collaborations
const collaborations = require('./api/music/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsPayloadSchema = require('./validator/music/schema/collaborations');

// playlistActivites
const playlistActivities = require('./api/music/playlistActivities');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

// exports
const _exports = require('./api/music/exports');
const producerService = require('./services/rabbitmq/ProducerService');
const ExportSongsFromPlaylistSchema = require('./validator/music/schema/exports');

// uploads
const uploads = require('./api/music/uploads');
const StorageService = require('./services/storage/StorageService');
const ImageHeadersSchema = require('./validator/music/schema/uploads');

// likeAlbum
const likeAlbum = require('./api/music/likeAlbum');
const LikeAlbumService = require('./services/postgres/LikeAlbumService');
const CacheService = require('./services/redis/CacheService');

const MusicValidator = require('./validator/music');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistActivitiesService = new PlaylistActivitiesService();
  const storageService = new StorageService(
    path.resolve(__dirname, './api/music/uploads/assets/images')
  );
  const cacheService = new CacheService();
  const likeAlbumService = new LikeAlbumService(cacheService);

  // create server
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // intervention fail response
  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  // register jwt schema for authentication
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // define strategy for authentication
  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // register plugin
  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: MusicValidator,
        schema: SongsPayloadSchema,
      },
    },
    {
      plugin: albums,
      options: {
        albumsService,
        songsService,
        validator: MusicValidator,
        schema: AlbumsPayloadSchema,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: MusicValidator,
        schema: UsersPayloadSchema,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        validator: MusicValidator,
        schema: {
          PostAuthenticationPayloadSchema,
          PutAuthenticationPayloadSchema,
          DeleteAuthenticationPayloadSchema,
        },
        usersService,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        songsService,
        playlistActivitiesService,
        validator: MusicValidator,
        schema: {
          PostPlaylistPayloadSchema,
          PostSongToPlaylistPayloadSchema,
          DeleteSongFromPlaylistPayloadSchema,
        },
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: MusicValidator,
        schema: CollaborationsPayloadSchema,
      },
    },
    {
      plugin: playlistActivities,
      options: {
        playlistActivitiesService,
        playlistsService,
      },
    },
    {
      plugin: _exports,
      options: {
        producerService,
        playlistsService,
        validator: MusicValidator,
        schema: ExportSongsFromPlaylistSchema,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsService,
        validator: MusicValidator,
        schema: ImageHeadersSchema,
      },
    },
    {
      plugin: likeAlbum,
      options: {
        likeAlbumService,
        albumsService,
      },
    },
  ]);

  // listening server
  await server.start();
  console.log(`Server listening on ${server.info.uri}`);
};

init();
