import React, { Component } from 'react';


const Player = props => {
  const src = `https://www.youtube.com/embed/${props.id}?enablejsapi=1`;
  const videoWrapperStyle = {
    position: 'relative',
    padding: '25px 0 56.25% 0' /* 16:9 */
  };
  const iframeStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
  };
  return (
    <div style={{ minWidth: '250px' }}>
      <div style={videoWrapperStyle}>
        <iframe
          src={src}
          title={props.title}
          style={iframeStyle}
          type='text/html'
          frameBorder='0'
          allowFullScreen
        />
      </div>
    </div>
  );
};

class YouTubePlayer extends Component {
  render() {
    const { videos } = this.props;
    if (videos.length > 0) {
      const id = videos[0].id;
      const title = videos[0].title;
      return (
        <Player id={id} title={title} />
      );
    }
    return null;
  }
}

export default YouTubePlayer;
