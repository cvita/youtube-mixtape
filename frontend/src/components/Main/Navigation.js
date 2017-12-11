import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TapeLogo from '../../assets/tape-white.svg';
import { Collapse, Navbar, Nav, NavItem, Button } from 'reactstrap';
import ArtistSearch from '../Home/ArtistSearch';
import './Navigation.css';


const NavigationItems = props => (
  <Nav className='ml-auto navigationItems' navbar>
    <NavItem className='navItem'>
      {props.children}
    </NavItem>
    {props.paths.map(path => {
      return (
        <NavItem className='navItem' key={path}>
          <Link className='navLink' to={`/${path}`} onClick={props.onClick}>{path}</Link>
        </NavItem>
      );
    })}
  </Nav>
);

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.handleResize = this.handleResize.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
    this.state = {
      width: window.innerWidth,
      isOpen: false,
      searchView: false
    };
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }
  componentWillUnmount() { // Future proofing, just in case
    window.removeEventListener('resize', this.handleResize);
  }
  handleResize() {
    this.setState({ width: window.innerWidth });
  }
  toggleCollapse() {
    this.setState({ isOpen: !this.state.isOpen });
  }
  handleSearchClick() {
    this.setState({ isOpen: false, searchView: !this.state.searchView });
  }
  handleNavClick() {
    this.setState({ isOpen: false, searchView: false });
  }
  render() {
    const { width, isOpen, searchView } = this.state;
    const homePath = window.location.pathname === '/';
    const paths = ['settings']; // ex. 'settings', 'profile', etc...

    if (searchView) {
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
    return (
      <div className='navigation'>
        <Navbar color='faded' expand='sm'>
          <Link className='navBrand' to='/'>
            <img src={TapeLogo} alt='YouTube Mixtape' />
          </Link>

          <div className='navbar-toggler'>
            {!homePath && (
              <Button
                onClick={this.handleSearchClick}
                className='searchViewButton'
                aria-label='Search'
                outline
              >
                <i className='fa fa-search' />
              </Button>)}
            <Button
              onClick={this.toggleCollapse}
              aria-label='Settings'
              outline
            >
              <i className='fa fa-bars' />
            </Button>
          </div>

          <Collapse isOpen={isOpen} navbar>
            <NavigationItems paths={paths} onClick={this.handleNavClick}>
              {!homePath && width > 575 && (
                <ArtistSearch {...this.props} />)}
            </NavigationItems>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}


export default Navigation;
