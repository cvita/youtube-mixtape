import React, { Component } from 'react';
import { push } from 'react-router-redux';
import store from '../../redux/store';
import { Input, InputGroup, InputGroupButton, Button } from 'reactstrap';


class ArtistSearch extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { clicked: false, userInput: '' };
  }
  handleClick() {
    const { spotifyAccess, fetchSpotifyAccessToken } = this.props;
    const shouldRenew = !spotifyAccess ? true : spotifyAccess.expiration < new Date().getTime();
    if (!this.state.clicked || shouldRenew) { // Avoid duplicate calls
      fetchSpotifyAccessToken();
    }
    this.setState({ clicked: true });
  }
  handleChange(event) {
    const value = event.target.value;
    // AutoSuggest feature here
    this.setState({ userInput: value });
  }
  handleSubmit(event) {
    event.preventDefault();
    const { userInput } = this.state;
    if (typeof userInput === 'string' && userInput !== '') {
      this.props.determineSimilarArtists(userInput, this.props.spotifyAccess, true); // Todo: add toggle for last arg, `applyFilter`
      if (this.props.hasOwnProperty('onSubmit')) {
        this.props.onSubmit();
      }
      store.dispatch(push(`/search:${encodeURIComponent(userInput)}`))
      this.setState({ userInput: '' });
    }
  }
  render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <InputGroup>
          <Input
            className='titleSearchInput'
            onClick={this.handleClick}
            onChange={this.handleChange}
            value={this.state.userInput}
            type='text'
            autoComplete='off'
            placeholder='Search artist'
          />
          <InputGroupButton>
            <Button
              onClick={this.handleSubmit}
              disabled={this.state.userInput === ''}
              color='primary'
              type='submit'
              style={{ cursor: 'pointer' }}
            >
              <i className='fa fa-search' aria-hidden='true' style={{ padding: '0 0.5em' }} />
            </Button>
          </InputGroupButton>
          {/* Todo: add autoSuggest */}
        </InputGroup>
      </form>
    );
  }
}


export default ArtistSearch;
