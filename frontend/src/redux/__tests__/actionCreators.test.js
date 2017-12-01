import * as actions from '../actionCreators';
import * as types from '../actionTypes';


describe('action creators', () => {
  it('should create an action to refresh stylesheet status', () => {
    const expectedAction = {
      type: types.REFRESH_STYLESHEET_STATUS,
      payload: null
    };
    expect(actions.refreshStyleSheetStatus()).toEqual(expectedAction);
  });

  it('should create an action to fetch a Spotify access token', () => {
    const expectedAction = {
      type: types.FETCH_SPOTIFY_TOKEN_REQUESTED,
      payload: null
    };
    expect(actions.fetchSpotifyAccessToken()).toEqual(expectedAction);
  });

  it('should create an action to determine similar artists', () => {
    const expectedAction = {
      type: types.DETERMINE_SIMILAR_ARTISTS_REQUESTED,
      payload: ['myArtist', 'stubAccessToken1234', true]
    };
    expect(actions.determineSimilarArtists('myArtist', 'stubAccessToken1234')).toEqual(expectedAction);
  });

  it('should create an action to fetch videos', () => {
    const expectedAction = {
      type: types.FETCH_VIDEOS_REQUESTED,
      payload: [{ name: 'myArtist' }, { name: 'myArtist' }, 10]
    };
    expect(actions.fetchVideos({ 'name': 'myArtist' }, { 'name': 'myArtist' })).toEqual(expectedAction);
  });
});
