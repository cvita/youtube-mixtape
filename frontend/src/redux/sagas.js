import { all, call, put, takeLatest } from 'redux-saga/effects';
import * as types from './actionTypes';
import youTube from '../client/youTube';


export function* fetchVideos(action) {
  try {
    const videos = yield call(youTube.fetchVideos, ...action.payload);
    yield put({ type: types.FETCH_VIDEOS_SUCCEEDED, payload: videos });
  } catch (e) {
    yield put({ type: types.FETCH_VIDEOS_FAILED, message: e.message });
  }
}


function* sagas() {
  yield all([
    takeLatest(types.FETCH_VIDEOS_REQUESTED, fetchVideos)
  ]);
}


export default sagas;
