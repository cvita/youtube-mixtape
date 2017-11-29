import React, { Component } from 'react';
import { Row, Col, Collapse, Button } from 'reactstrap';
import YouTubePlayer from './YouTubePlayer';
// import tape from '../../assets/tape-white.svg'
import './Player.css';

// const CassetteIcon = () => (
//   <div className='tapeIcon'>
//     <div className='cassetteCog1'>
//       <i className='fa fa-cog fa-spin' aria-hidden='true' />
//     </div>
//     <div className='cassetteCog2'>
//       <i className='fa fa-cog fa-spin' aria-hidden='true' />
//     </div>
//     <img src={tape} alt='cassette tape' />
//   </div>
// );

class Player extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.state = {
      collapse: false,
      visible: true
    };
  }
  componentDidMount() {
    this.setState({ collapse: true });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.selectedArtist !== nextProps.selectedArtist) {
      this.setState({ collapse: true });
    }
  }
  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }
  handleEnd() {
    const { artists, sortedArtists, selectedArtist } = this.props;
    const currentArtistIndex = sortedArtists.indexOf(selectedArtist.artist);
    const nextArtistName = sortedArtists[currentArtistIndex + 1]
    const nextArtist = artists[nextArtistName];
    this.props.fetchVideos(nextArtist, this.props.played);
  }
  render() {
    if (this.props.selectedArtist) {
      const { video } = this.props.selectedArtist;
      const showHide = this.state.collapse ?
        <i className='fa fa-angle-double-down' aria-hidden='true' /> :
        <i className='fa fa-angle-double-up' aria-hidden='true' />;

      return (
        <div className='player'>
          <div className='container-fluid'>
            <Row>

              <Col sm='8' xs='12'>
                <Collapse isOpen={this.state.collapse}>
                  <div className='youTubeIframe'>
                    <YouTubePlayer id={video.id} handleEnd={this.handleEnd} />
                  </div>
                </Collapse>
                {!this.state.collapse && (
                  <h1 className='playerVideoTitle'><span>Now playing:</span> {video.title}</h1>)}
              </Col>

              <Col sm='4' xs='12'>
                <div className='playerRight'>
                  <Button className='showHideButton' onClick={this.toggle} color='secondary'>
                    {showHide}
                  </Button>
                </div>
              </Col>

            </Row>
          </div>
        </div>
      );
    }
    return null;
  }
}


export default Player;
