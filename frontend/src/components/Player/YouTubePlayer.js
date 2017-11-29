import React, { Component } from 'react';
import YouTube from 'react-youtube';


class YouTubePlayer extends Component {
  render() {
    const { id } = this.props;

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

    return (
      <div style={{ minWidth: '250px' }}>
        <div style={videoWrapperStyle}>
          <div style={iframeStyle}>
            <YouTube
              videoId={id}
              opts={options}
              onReady={this._onReady}
              onEnd={this.props.handleEnd}
            />
          </div>
        </div>
      </div>
    );
  }

  _onReady(event) {
    // access to player in all event handlers via event.target
    // event.target.pauseVideo();
  }
}


export default YouTubePlayer;
