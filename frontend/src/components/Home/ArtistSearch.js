import React, { Component } from 'react';
import { Input, InputGroup, InputGroupButton, Button } from 'reactstrap';


class ArtistSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { userInput: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    const value = event.target.value;
    const shouldRenewAccess = this.props.spotifyAccess &&
      this.props.spotifyAccess.expiration &&
      this.props.spotifyAccess.expiration < new Date().getTime();
    if (value.length === 1) { // Avoid duplicate calls
      if (!this.props.spotifyAccess || shouldRenewAccess) {
        this.props.fetchSpotifyAccessToken();
      }
    }
    // AutoSuggest feature here
    this.setState({ userInput: value });
  }
  handleSubmit(event) {
    event.preventDefault();
    const { userInput } = this.state;
    if (typeof userInput === 'string' && userInput !== '') {
      this.props.determineSimilarArtists(userInput, this.props.spotifyAccess.access_token, true); // Todo: add toggle for last arg, `applyFilter`
      this.setState({ userInput: '' });
    }
  }
  render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <InputGroup>
          <Input
            className='titleSearchInput'
            onChange={this.handleChange}
            value={this.state.userInput}
            type='text'
            autoComplete='off'
            placeholder='Artist or band'
          />
          <InputGroupButton>
            <Button
              onClick={this.handleSubmit}
              disabled={this.state.userInput === ''}
              color='primary'
              type='submit'
            >
              <i className="fa fa-search" aria-hidden="true" /> Search
            </Button>
          </InputGroupButton>
          {/* Todo: add autoSuggest */}
        </InputGroup>
      </form>
    );
  }
}


export default ArtistSearch;
