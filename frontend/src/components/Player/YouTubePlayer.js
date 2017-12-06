import React, { Component } from 'react';
import YouTube from 'react-youtube';


const youTubeContainerOuter = {
  maxWidth: '75vh',
  minWidth: '250px',
  margin: '0 auto 2em auto'
};
const youTubeContainerInner = {
  position: 'relative',
  padding: '25px 0 56.25% 0' /* 16:9 */
};
const iframeStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
};

class YouTubePlayer extends Component {
  constructor(props) {
    super(props);
    this.handleError = this.handleError.bind(this);
    this.handleOnReady = this.handleOnReady.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleControl = this.handleControl.bind(this);
    this.state = { player: null };
  }
  handleError(event) {
    this.props.updatePlayer({
      playerState: -1, // https://developers.google.com/youtube/iframe_api_reference
      duration: 0,
      elapsed: 0,
      error: event.data
    });
  }
  handleOnReady(event) {
    if (!this.state.player) {
      this.setState({ player: event.target }); // Access to YouTube API
    }
    this.handleStateChange(); // Update state prior to first video playback
  }
  handleStateChange() {
    const { player } = this.state;
    this.props.updatePlayer({
      playerState: player.getPlayerState(),
      duration: player.getDuration(),
      elapsed: player.getCurrentTime(),
      error: null
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.actionRequest !== nextProps.actionRequest) {
      this.handleControl(nextProps.actionRequest.action);
    }
  }
  handleControl(control) {
    const { player } = this.state;
    const currentTime = player.getCurrentTime();
    switch (control) {
      case 'play':
        return player.playVideo();
      case 'pause':
        return player.pauseVideo();
      case 'fastForward':
        return player.seekTo(currentTime + 5, true);
      case 'fastRewind':
        return player.seekTo(currentTime - 5, true);
      default:
        return;
    }
  }
  render() {
    const { selectedArtist, onEnd, onError } = this.props;

    return (
      <div style={youTubeContainerOuter}>
        <div style={youTubeContainerInner}>
          <div style={iframeStyle}>
            <YouTube
              videoId={selectedArtist.video.id}
              onReady={this.handleOnReady}
              onStateChange={this.handleStateChange}
              onEnd={onEnd}
              onError={event => {
                this.handleError(event);
                onError();
              }}
              opts={{
                height: '100%',
                width: '100%',
                playerVars: { autoplay: 1, enablejsapi: 1 }
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}


export default YouTubePlayer;
