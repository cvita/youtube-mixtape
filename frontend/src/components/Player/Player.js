import React, { Component } from 'react';
import { Collapse, Button } from 'reactstrap';
import YouTubePlayer from './YouTubePlayer';
import Counter from './Counter';
import PlayerUi from './PlayerUi';
import './Player.css';


class Player extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleControl = this.handleControl.bind(this);
    this.handleNewSong = this.handleNewSong.bind(this);
    this.state = {
      collapse: false,
      playerState: -1,
      duration: 0,
      elapsed: 0,
      playerControlAction: null
    };
  }
  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }
  handleEnd() {
    const { artists, sortedArtists, selectedArtist, played, fetchVideos } = this.props;
    const currentArtistIndex = sortedArtists.indexOf(selectedArtist.artist.name);
    const nextArtistName = sortedArtists[currentArtistIndex + 1];
    fetchVideos(artists[nextArtistName], played);
  }
  handleStateChange(change) {
    this.setState({
      playerState: change.playerState,
      duration: change.duration,
      elapsed: change.elapsed,
      playerControlAction: null
    });
  }
  handleControl(control) {
    this.setState({ playerControlAction: control });
  }
  handleNewSong(control) {
    if (control === 'next') {
      this.props.fetchVideos(this.props.selectedArtist.artist, this.props.played);
    }
    // Todo: create easy method for replaying last video
    if (control === 'previous') {
      console.log(`${control.toUpperCase()} feature not yet developed`);
    }
  }
  render() {
    if (this.props.selectedArtist) {
      const { artist, video } = this.props.selectedArtist;
      const { collapse, playerControlAction } = this.state;
      const showHide = collapse ?
        <i className='fa fa-angle-double-down' aria-hidden='true' /> :
        <i className='fa fa-angle-double-up' aria-hidden='true' />;

      return (
        <div className='player'>
          <Collapse isOpen={collapse}>
            <YouTubePlayer
              id={video.id}
              handleEnd={this.handleEnd}
              handleStateChange={this.handleStateChange}
              videoControl={playerControlAction}
            />
          </Collapse>

          <div className='showHideAndCounter'>
            <Counter {...this.state} />
            <Button className='showHideButton' onClick={this.toggle} color='secondary'>
              {showHide}
            </Button>
          </div>

          <PlayerUi
            artist={artist}
            video={video}
            playerState={this.state}
            handleControl={this.handleControl}
            handleNewSong={this.handleNewSong}
          />
        </div>
      );
    }
    return null;
  }
}


export default Player;
