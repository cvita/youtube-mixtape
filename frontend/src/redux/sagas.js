import { all, call, put, takeLatest } from 'redux-saga/effects';
import * as types from './actionTypes';
import spotify from '../client/spotify';
import youTube from '../client/youTube';
import videoSelection from '../client/videoSelection';
import blacklist from '../client/blacklist';


export function* fetchSpotifyAccessToken(action) {
  try {
    const token = yield call(spotify.fetchSpotifyAccessToken);
    yield put({ type: types.FETCH_SPOTIFY_TOKEN_SUCCEEDED, payload: token });
  } catch (e) {
    yield put({ type: types.FETCH_SPOTIFY_TOKEN_FAILED, message: e.message });
  }
}

export function* determineSimilarArtists(action) {
  try {
    var token = action.payload[1];
    if (!token) { // Attempt to recover if `fetchSpotifyAccessToken` saga failed
      token = yield call(spotify.fetchSpotifyAccessToken);
      action.payload[1] = token;
      yield put({ type: types.FETCH_SPOTIFY_TOKEN_SUCCEEDED, payload: token });
    }

    var initialArtistInfo = yield call(spotify.fetchInitialArtist, ...action.payload);
    yield put({ type: types.FETCH_INITIAL_ARTIST_SUCCEEDED, payload: initialArtistInfo });

    action.payload[0] = initialArtistInfo;
    const similarArtists = yield call(spotify.determineSimilarArtists, ...action.payload);
    yield put({ type: types.DETERMINE_SIMILAR_ARTISTS_SUCCEEDED, payload: similarArtists });

  } catch (e) {
    if (!token) {
      yield put({ type: types.FETCH_SPOTIFY_TOKEN_FAILED, message: e.message });
    } else if (!initialArtistInfo) {
      yield put({ type: types.FETCH_INITIAL_ARTIST_FAILED, message: e.message });
    } else {
      yield put({ type: types.DETERMINE_SIMILAR_ARTISTS_FAILED, message: e.message });
    }
  }
}

export function* fetchVideos(action) {
  try {
    const played = action.payload[1];
    var videos = yield call(youTube.fetchVideos, ...action.payload); // `var` to share scope with catch block
    yield put({ type: types.FETCH_VIDEOS_SUCCEEDED, payload: videos });

    const selectedVideo = yield call(videoSelection.selectVideo, videos, played);
    yield put({ type: types.SELECT_VIDEO_SUCCEEDED, payload: selectedVideo });

  } catch (e) {
    if (!videos) {
      yield put({ type: types.FETCH_VIDEOS_FAILED, message: e.message });
    } else {
      yield put({ type: types.SELECT_VIDEO_FAILED, message: e.message });
    }
  }
}

export function* addToBlacklist(action) {
  try {
    const doc = yield call(blacklist.addToBlacklist, ...action.payload);
    yield put({ type: types.ADD_TO_BLACKLIST_SUCCEEDED, payload: doc });
  } catch (e) {
    yield put({ type: types.ADD_TO_BLACKLIST_FAILED, message: e.message });
  }
}


function* sagas() {
  yield all([
    takeLatest(types.FETCH_SPOTIFY_TOKEN_REQUESTED, fetchSpotifyAccessToken),
    takeLatest(types.DETERMINE_SIMILAR_ARTISTS_REQUESTED, determineSimilarArtists),
    takeLatest(types.FETCH_VIDEOS_REQUESTED, fetchVideos),
    takeLatest(types.ADD_TO_BLACKLIST_REQUESTED, addToBlacklist)
  ]);
}


export default sagas;
