import * as types from './actionTypes';


export const refreshStyleSheetStatus = () => ({
  type: types.REFRESH_STYLESHEET_STATUS,
  payload: null
});

export const fetchVideos = (artist, maxResults = 10) => ({
  type: types.FETCH_VIDEOS_REQUESTED,
  payload: [artist, maxResults]
});
