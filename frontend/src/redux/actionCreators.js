import * as types from './actionTypes';


export const refreshStyleSheetStatus = () => ({
  type: types.REFRESH_STYLESHEET_STATUS,
  payload: null
});

// Placeholder to set up sagas. Not actually usable
export const fetchVideos = input => ({
  type: types.FETCH_VIDEOS_REQUESTED,
  payload: input
});
