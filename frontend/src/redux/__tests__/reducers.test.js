import initialState from '../initialState';
import * as reducers from '../reducers';
import * as types from '../actionTypes';
import { selectedArtist } from '../reducers';


describe('reducers: `styleSheeLoaded`', () => {
  it('should return the initial state', () => {
    expect(reducers.styleSheetLoaded(undefined, {})).toEqual(initialState.styleSheetLoaded)
  });

  it(`should handle ${types.REFRESH_STYLESHEET_STATUS}`, () => {
    const stubData = [{}];
    expect(reducers.styleSheetLoaded(stubData, types.REFRESH_STYLESHEET_STATUS)).toEqual(stubData);
  });
});


describe('reducers: `artists`', () => {
  it('should return the initial state', () => {
    expect(reducers.artists(undefined, {})).toEqual(initialState.artists)
  });

  it(`should handle ${types.FETCH_INITIAL_ARTIST_SUCCEEDED}`, () => {
    const stubData = { 'myArtist': {} };
    expect(reducers.artists(stubData, types.FETCH_INITIAL_ARTIST_SUCCEEDED)).toEqual(stubData);
  });

  it(`should handle ${types.DETERMINE_SIMILAR_ARTISTS_SUCCEEDED}`, () => {
    const stubData = { 'myArtist': {}, 'myOtherArtist': {} };
    expect(reducers.artists(stubData, types.DETERMINE_SIMILAR_ARTISTS_SUCCEEDED)).toEqual(stubData);
  });

  it(`should handle ${types.FETCH_VIDEOS_SUCCEEDED}`, () => {
    const stubData = { 'myArtist': { videos: [] }, 'myOtherArtist': {} };
    expect(reducers.artists(stubData, types.FETCH_VIDEOS_SUCCEEDED)).toEqual(stubData);
  });
});

describe('reducers: `selectedArtist`', () => {
  it('should return the initial state', () => {
    expect(reducers.selectedArtist(undefined, {})).toEqual(initialState.selectedArtist)
  });

  const stubData = { artist: {}, videos: {} };
  expect(reducers.selectedArtist(stubData, types.SELECT_VIDEO_SUCCEEDED)).toEqual(stubData);
  expect(reducers.selectedArtist(stubData, types.RESELECT_VIDEO)).toEqual(stubData);
});


describe('reducers: `errors`', () => {
  it('should return the initial state', () => {
    expect(reducers.errors(undefined, {})).toEqual(initialState.errors)
  });

  it('should handle any `FAILED` actionType', () => {
    const stubError = new Error();
    expect(reducers.artists(stubError, types.DETERMINE_SIMILAR_ARTISTS_FAILED)).toEqual(stubError);
    expect(reducers.spotifyAccess(stubError, types.FETCH_SPOTIFY_TOKEN_FAILED)).toEqual(stubError);
  });
});
