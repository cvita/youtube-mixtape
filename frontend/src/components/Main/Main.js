import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import FadeIn from '../helper/FadeIn';
import Navigation from './Navigation';
import Home from '../Home/Home';
import NoResults from '../Home/NoResults';
import Artists from '../Artists/Artists';
import Player from '../Player/Player';
import './Main.css';


class Main extends Component {
  componentWillMount() {
    // Ensures app knows when stylesheet has loaded
    document.getElementById('styleSheetBootstrap').addEventListener('load', this.props.refreshStyleSheetStatus);
  }
  render() {
    return (
      <div className='mainBody'>
        <header className='mainHeader'>
          {this.props.styleSheetLoaded && (
            <FadeIn>
              <Navigation {...this.props} />
            </FadeIn>)}
        </header>

        <main className='mainContent'>
          <Switch>
            <Route path='/' exact={true} render={() => <Home {...this.props} />} />
            <Route path='/search:*' render={() => (
              <div>
                <NoResults {...this.props} />
                <Artists {...this.props} />
              </div>)} />
            <Route path='/settings' render={() => <p className='text-center'>A 'Settings' page placeholder</p>} />
          </Switch>
        </main>

        <Player {...this.props} />

        <footer className='mainFooter' style={{ paddingTop: '2em', background: '#494949' }}>
          <p className='text-center'><a href='https://github.com/VitaC123/youtube-mixtape'>View source</a></p>
        </footer>
      </div>
    );
  }
}


export default Main;
