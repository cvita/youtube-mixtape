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
    const { selectedArtist, played, artists, fetchVideos, reselectVideo } = this.props;
    const currentPosition = played.findIndex(playedVideo => playedVideo.id === selectedArtist.video.id);
    if (action === 'next') {
      if (currentPosition === played.length - 1) {
        return fetchVideos(artists[selectedArtist.name], played);
      }
      const nextVideoInQueue = played[currentPosition + 1];
      return reselectVideo(nextVideoInQueue);
    }
    if (action === 'previous') {
      const previousVideoInQueue = currentPosition === 0 ? played[0] : played[currentPosition - 1];
      return reselectVideo(previousVideoInQueue);
    }
    this.setState({
      playerActionRequest: { action, timestamp: new Date().getTime() }
    });
  }
  handleEnd() {
    const { artists, sortedArtists, selectedArtist, played, fetchVideos } = this.props;
    const currentArtistIndex = sortedArtists.indexOf(selectedArtist.artist.name);
    const nextArtistName = sortedArtists[currentArtistIndex + 1];
    fetchVideos(artists[nextArtistName], played);
  }
  handleError() {
    const { name, video } = this.props.selectedArtist;
    this.props.addToBlacklist(name, video);
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
