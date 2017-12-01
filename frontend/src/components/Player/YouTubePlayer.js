import React, { Component } from 'react';
import YouTube from 'react-youtube';


class YouTubePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = { player: null };
    this.handleOnReady = this.handleOnReady.bind(this);
    this.handleControl = this.handleControl.bind(this);
  }
  handleOnReady(event) {
    if (!this.state.player) {
      this.setState({ player: event });
    }
  }
  handleControl(control) {
    const player = this.state.player.target;
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
    const { id, videoControl } = this.props;
    const videoWrapperStyle = {
      position: 'relative',
      padding: '25px 0 56.25% 0' /* 16:9 */
    };
    const iframeStyle = {
      width: '100%',
      height: '100%',
      position: 'absolute',
    };
    const options = {
      height: '100%',
      width: '100%',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        enablejsapi: 1
      }
    };

    if (videoControl) {
      this.handleControl(videoControl);
    }
    return (
      <div style={{ maxWidth: '75vh', minWidth: '250px', margin: '0 auto 2em auto' }}>
        <div style={videoWrapperStyle}>
          <div style={iframeStyle}>
            <YouTube
              videoId={id}
              opts={options}
              onReady={this.handleOnReady}
              onEnd={this.props.handleEnd}
              onStateChange={(event) => (
                this.props.handleStateChange({
                  playerState: event.target.getPlayerState(),
                  duration: event.target.getDuration(),
                  elapsed: event.target.getCurrentTime()
                })
              )}
            />
          </div>
        </div>
      </div>
    );
  }
}


export default YouTubePlayer;
