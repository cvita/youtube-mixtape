import * as types from './actionTypes';


export const refreshStyleSheetStatus = () => ({
  type: types.REFRESH_STYLESHEET_STATUS,
  payload: null
});

export const updatePlayer = player => ({
  type: types.UPDATE_PLAYER,
  payload: player
});

export const fetchSpotifyAccessToken = () => ({
  type: types.FETCH_SPOTIFY_TOKEN_REQUESTED,
  payload: null
});

export const determineSimilarArtists = (initialArtistName, accessToken, applyFilter = true) => ({
  type: types.DETERMINE_SIMILAR_ARTISTS_REQUESTED,
  payload: [initialArtistName, accessToken, applyFilter]
});

export const fetchVideos = (artist, played, maxResults = 10) => ({
  type: types.FETCH_VIDEOS_REQUESTED,
  payload: [artist, played, maxResults]
});

export const selectVideo = artist => ({
  type: types.SELECT_VIDEO_REQUESTED,
  payload: artist
});

export const reselectVideo = (artist, video) => ({
  type: types.RESELECT_VIDEO,
  payload: { artist, video }
});

export const addToBlacklist = (artist, video) => ({
  type: types.ADD_TO_BLACKLIST_REQUESTED,
  payload: [artist, video]
});
