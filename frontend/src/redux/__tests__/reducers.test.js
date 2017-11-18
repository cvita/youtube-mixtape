import initialState from '../initialState';
import * as reducers from '../reducers';
import * as types from '../actionTypes';


describe('reducers: `styleSheeLoaded`', () => {
  it('should return the initial state', () => {
    expect(reducers.styleSheetLoaded(undefined, {})).toEqual(initialState.styleSheetLoaded)
  });

  it(`should handle ${types.REFRESH_STYLESHEET_STATUS}`, () => {
    const stubData = [{}];
    expect(reducers.styleSheetLoaded(stubData, types.REFRESH_STYLESHEET_STATUS)).toEqual(stubData);
  });
});


describe('reducers: `errors`', () => {
  it('should return the initial state', () => {
    expect(reducers.errors(undefined, {})).toEqual(initialState.errors)
  });

  it('should handle any `FAILED` actionType', () => {
    const stubError = new Error();
    expect(reducers.videos(stubError, types.FETCH_VIDEOS_FAILED)).toEqual(stubError);
  });
});
