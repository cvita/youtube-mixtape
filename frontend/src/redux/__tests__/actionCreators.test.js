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

  it('should create an action to fetch videos', () => {
    const expectedAction = {
      type: types.FETCH_VIDEOS_REQUESTED,
      payload: 'example'
    };
    expect(actions.fetchVideos('example')).toEqual(expectedAction);
  });
});
