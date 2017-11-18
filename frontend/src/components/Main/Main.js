import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from '../Home/Home';

import { Container } from 'reactstrap';
import './Main.css';


class Main extends Component {
  componentWillMount() {
    // Ensures app knows when stylesheet has loaded
    document.getElementById('styleSheetBootstrap').addEventListener('load', this.props.refreshStyleSheetStatus);
  }
  render() {
    return (
      <div className='mainBody'>

        <div className='mainContent'>
          <header>
            <h1 className='text-center'>YouTube Mixtape</h1>
          </header>
          <main>
            <Container>
              <Switch>
                <Route path='/' exact={true} render={() => <Home {...this.props} />} />
              </Switch>
            </Container>
          </main>
        </div>

        <footer className='mainFooter'>
          <p className='text-center'><a href='https://github.com/VitaC123/youtube-mixtape'>View source</a></p>
        </footer>
      </div>
    );
  }
}


export default Main;
