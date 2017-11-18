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
    this.setState({ userInput: value });
    // AutoSuggest here
  }
  handleSubmit(event) {
    event.preventDefault();
    const { userInput } = this.state;
    if (typeof userInput === 'string' && userInput !== '') {
      this.props.fetchVideos(userInput);
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
