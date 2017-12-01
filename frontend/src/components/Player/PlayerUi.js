import React, {Component} from 'react';
import {Container, Row, Col} from 'reactstrap';
import './PlayerUi.css';


class PlayerUi extends Component {
  constructor(props) {
    super(props);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.state = { playing: true };
  }
  togglePlaying() {
    const playOrPause = this.state.playing ? 'pause' : 'play'; // make opposite action
    this.props.handleControl(playOrPause);
    this.setState({ playing: !this.state.playing });
  }
  render() {
    const { artist, video, playerState, handleControl } = this.props;
    const playPauseLabel = this.state.playing ? 'pause' : 'play';
    const title = video.title
      .replace(artist.name, '')
      .replace('-', '')
      .trim();

    return (
      <Container>
        <Row>
          <Col lg='2' md='3' sm='4' xs='12'>
            {!playerState.collapse && (
              <img className='playerUiThumbnail' src={video.thumbnails.default.url} alt={artist.name} />)}
          </Col>

          <Col lg='4' md='3' sm='8' xs='12'>
            <div className='playerUiTitle'>
              <h1>{artist.name}</h1>
              <h2>{title}</h2>
            </div>
          </Col>

          <Col md='6' sm='12' xs='12'>
            <div className='playerUiButtons'>
              <button className='fa fa-step-backward' onClick={() => this.props.handleNewSong('previous')} />
              <button className='fa fa-fast-backward' onClick={() => handleControl('fastRewind')} />
              <button className={`fa fa-${playPauseLabel}`} onClick={this.togglePlaying} id='playPause' />
              <button className='fa fa-fast-forward' onClick={() => handleControl('fastForward')} />
              <button className='fa fa-step-forward' onClick={() => this.props.handleNewSong('next')} />
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}


export default PlayerUi;
