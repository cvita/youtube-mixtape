import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import initialState from './initialState';
import * as types from './actionTypes';


// Async
export const styleSheetLoaded = (state = initialState.styleSheetLoaded) => {
  const styleSheetHref = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css';
  if (document.styleSheets.length > 0 && document.styleSheets[0].href === styleSheetHref) {
    return true;
  } else {
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
}

export const initialArtist = (state = initialState.initialArtist, action) => {
  switch (action.type) {
    case types.FETCH_INITIAL_ARTIST_SUCCEEDED:
      return action.payload;
    default:
      return state;
  }
}

export const artists = (state = initialState.artists, action) => {
  switch (action.type) {
    case types.DETERMINE_SIMILAR_ARTISTS_SUCCEEDED:
      return action.payload;
    default:
      return state;
  }
}

export const videos = (state = initialState.videos, action) => {
  switch (action.type) {
    case types.FETCH_VIDEOS_SUCCEEDED:
      return action.payload;
    default:
      return state;
  }
};

export const errors = (state = initialState.errors, action) => {
  if (action.type && action.type.indexOf('FAILED') !== -1) {
    console.error(action);
    return [...state, action];
  }
  return state;
};


const rootReducer = combineReducers({
  styleSheetLoaded,
  spotifyAccess,
  initialArtist,
  artists,
  videos,
  errors,
  routing: routerReducer
});


export default rootReducer;
