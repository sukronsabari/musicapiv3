/* eslint-disable camelcase */
const mapSongInDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

// const mapDetailAlbumInDBToModel = ({
//   id,
//   name,
//   year,
//   song_id,
//   song_title,
//   performer,
// }) => ({
//   id,
//   name,
//   year,

// });

module.exports = { mapSongInDBToModel };
