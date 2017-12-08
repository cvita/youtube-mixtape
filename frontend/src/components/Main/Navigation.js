import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Navbar, Nav, NavItem, Button } from 'reactstrap';
import TapeLogo from '../../assets/tape-white.svg';
import ArtistSearch from '../Home/ArtistSearch';
import './Navigation.css';


const NavigationItems = props => (
  <Nav className='ml-auto' navbar>
    <NavItem className='navItem'>
      {props.children}
    </NavItem>
    {props.paths.map(path => {
      return (
        <NavItem className='navItem' key={path}>
          <Link className='navLink' to={`/${path}`}>{path}</Link>
        </NavItem>
      );
    })}
  </Nav>
);

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
    this.state = { isOpen: false, searchView: false };
  }
  toggle() {
    this.setState({ isOpen: !this.state.isOpen });
  }
  handleSearchClick() {
    this.setState({ isOpen: false, searchView: !this.state.searchView });
  }
  render() {
    const { routing } = this.props;
    const { searchView, isOpen } = this.state;
    const currentPath = routing && routing.location ? routing.location.pathname : '/';
    const paths = []; // ex. 'settings', 'profile', etc...

    if (!searchView) {
      return (
        <div className='navigation'>
          <Navbar color='faded' expand='sm'>
            <Link className='navBrand' to='/'>
              <img src={TapeLogo} alt='YouTube Mixtape' />
            </Link>

            <div className='navbar-toggler'>
              <Button
                onClick={this.handleSearchClick}
                outline
                style={{ marginRight: '1em' }}
              >
                <i className='fa fa-search' aria-hidden='true' />
              </Button>
              <Button
                onClick={this.toggle}
                type='button'
                data-toggle='collapse'
                data-target='#navbarSupportedContent'
                outline
              >
                <span className='fa fa-bars'>
                  {/* Next line to comply with accessability */}
                  <span className='navbarToggleText'>Navbar toggle</span>
                </span>
              </Button>
            </div>

            <Collapse isOpen={isOpen} navbar>
              <NavigationItems paths={paths}>
                {currentPath !== '/' && (
                  <div className='navArtistSearchContainer'>
                    <ArtistSearch onSubmit={() => console.log('searching')} {...this.props} />
                  </div>)}
              </NavigationItems>
            </Collapse>

          </Navbar>
        </div>
      );
    }
    return (
      <div className='navigation searchView'>
        <Button
          className='cancelSearchButton'
          onClick={this.handleSearchClick}
          outline
        >
          <i className='fa fa-arrow-left' />
        </Button>
        <ArtistSearch onSubmit={this.handleSearchClick} {...this.props} />
      </div>
    );
  }
}


export default Navigation;
