import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from '../Home/Home';
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
            <h1>Nav</h1>
          </header>
          <main>
            <Switch>
              <Route path='/' exact={true} render={() => <Home {...this.props} />} />
            </Switch>
          </main>
        </div>

        <footer className='mainFooter'>
          <h1>Footer</h1>
        </footer>
      </div>
    );
  }
}


export default Main;
