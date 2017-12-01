import React from 'react';

import { ConnectedRouter } from 'react-router-redux';
import { history } from './redux/store';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from './redux/actionCreators';

import Main from './components/Main/Main';


const App = props => (
  <ConnectedRouter history={history}>
    <Main {...props} />
  </ConnectedRouter>
);

const mapStateToProps = state => ({
  styleSheetLoaded: state.styleSheetLoaded,
  spotifyAccess: state.spotifyAccess,
  artists: state.artists,
  sortedArtists: state.sortedArtists,
  selectedArtist: state.selectedArtist,
  played: state.played,
  errors: state.errors,
  routing: state.routing
});

const mapDispatchToProps = dispatch => (bindActionCreators(actionCreators, dispatch));

export default connect(mapStateToProps, mapDispatchToProps)(App);
