import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import initialState from './initialState';
import * as types from './actionTypes';


export const styleSheetLoaded = (state = initialState.styleSheetLoaded) => {
  const styleSheetHref = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css';
  if (document.styleSheets.length > 0 && document.styleSheets[0].href === styleSheetHref) {
    return true;
  } else {
    return state;
  }
};

export const player = (state = initialState.player, action) => {
  switch (action.type) {
    case types.UPDATE_PLAYER:
      return action.payload;
    default:
      return state;
  }
};

export const spotifyAccess = (state = initialState.spotifyAccess, action) => {
  switch (action.type) {
    case types.FETCH_SPOTIFY_TOKEN_SUCCEEDED:
      return action.payload;
    default:
      return state;
  }
};

export const artists = (state = initialState.artists, action) => {
  switch (action.type) {
    case types.FETCH_INITIAL_ARTIST_SUCCEEDED:
      return { [action.payload.name]: action.payload };
    case types.DETERMINE_SIMILAR_ARTISTS_SUCCEEDED:
      return action.payload;
    case types.FETCH_VIDEOS_SUCCEEDED:
      const { artist, videos } = action.payload;
      state[artist.name].videos = videos;
      return state;
    case types.ADD_TO_BLACKLIST_SUCCEEDED:
      // Todo: remove blacklisted video from artist results.
      // Want to avoid having listener encounter again in their session.
      console.log(action.payload);
      return state;
    default:
      return state;
  }
};

export const sortedArtists = (state = initialState.sortedArtists, action) => {
  switch (action.type) {
    case types.DETERMINE_SIMILAR_ARTISTS_SUCCEEDED:
      const artists = action.payload;
      const preSort = Object.keys(artists).map(key => ({ ...artists[key] }));
      const sorted = preSort.sort((a, b) => b.relevance - a.relevance);
      return sorted.map(artist => artist.name);
    default:
      return state;
  }
};

export const played = (state = initialState.played, action) => {
  switch (action.type) {
    case types.SELECT_VIDEO_SUCCEEDED:
      const { artist, video } = action.payload;
      state.push({ artist: artist.name, ...video });
      return state;
    default:
      return state;
  }
};

export const selectedArtist = (state = initialState.selectedArtist, action) => {
  switch (action.type) {
    case types.SELECT_VIDEO_SUCCEEDED:
    case types.RESELECT_VIDEO:
      return action.payload;
    default:
      return state;
  }
};

export const errors = (state = initialState.errors, action) => {
  if (action.type && action.type.indexOf('FAILED') !== -1) {
    console.error(action);
    return { recent: action, all: [...state.all, action] };
  }
  return { recent: null, all: [...state.all] };
};


const rootReducer = combineReducers({
  styleSheetLoaded,
  spotifyAccess,
  artists,
  sortedArtists,
  selectedArtist,
  played,
  player,
  errors,
  routing: routerReducer
});


export default rootReducer;
