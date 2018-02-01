import React, { Component } from 'react';
import Collapsible from '../helper/Collapsible';
import YouTubePlayer from './YouTubePlayer';
import Counter from './Counter';
import PlayerUi from './PlayerUi';
import './Player.css';


class Player extends Component {
  constructor(props) {
    super(props);
    this.handleCollapse = this.handleCollapse.bind(this);
    this.handlePlayerActionRequest = this.handlePlayerActionRequest.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleError = this.handleError.bind(this);
    this.state = { collapsed: true, playerActionRequest: null };
  }
  handleCollapse() {
    this.setState({ collapsed: !this.state.collapsed });
  }
  handlePlayerActionRequest(action) {
    const { selectedArtist, played, artists } = this.props;
    const currentIndex = played.length > 0 ? played.findIndex(video => video.id === selectedArtist.video.id) : 0;
    if (action === 'next') {
      if (currentIndex === played.length - 1) {
        // Select and play a new video
        this.props.fetchVideos(selectedArtist.artist, played);
      } else {
        // Play next video in `played` queue
        const nextVideo = played[currentIndex + 1];
        const nextArtist = artists[nextVideo.artist];
        this.props.reselectVideo(nextArtist, nextVideo);
      }
    } else if (action === 'previous') {
      // Play previous video in `played` queue
      const previousVideo = currentIndex > 0 ? played[currentIndex - 1] : played[0];
      const previousArtist = artists[previousVideo.artist];
      this.props.reselectVideo(previousArtist, previousVideo);
    } else {
      this.setState({
        playerActionRequest: { action, timestamp: new Date().getTime() }
      });
    }
  }
  handleEnd() {
    const { artists, sortedArtists, selectedArtist, played, fetchVideos } = this.props;
    const currentArtistIndex = sortedArtists.indexOf(selectedArtist.artist.name);
    const nextArtistName = sortedArtists[currentArtistIndex + 1];
    fetchVideos(artists[nextArtistName], played);
  }
  handleError() {
    const { artist, video } = this.props.selectedArtist;
    this.props.addToBlacklist(artist, video);
    this.handlePlayerActionRequest('next');
  }
  render() {
    const { selectedArtist, player } = this.props;
    const { playerActionRequest, collapsed } = this.state;

    if (selectedArtist) {
      return (
        <div className='player'>
          <Collapsible onCollapse={this.handleCollapse}>
            <YouTubePlayer
              {...this.props}
              actionRequest={playerActionRequest}
              onEnd={this.handleEnd}
              onError={this.handleError}
            />
          </Collapsible>

          <Counter className='counter' {...player} />

          <PlayerUi
            selectedArtist={selectedArtist}
            playerState={player.playerState}
            playerCollapsed={collapsed}
            onClick={this.handlePlayerActionRequest}
          />
        </div>
      );
    }
    return null;
  }
}


export default Player;
