import React, { Component } from 'react';
import LazyFadeIn from '../helper/LazyFadeIn';
import { Container, Row, Col, Card, CardText, CardBody } from 'reactstrap';
import './Artists.css';


const Artist = props => {
  const { name, images, handleClick, featured } = props;
  const size = window.innerWidth > 500 ? 1 : 2; // Request appropriate image size
  const imageStyle = {
    background: `url(${images[size].url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
  const icon = featured ?
    <i className='fa fa-volume-up featuredIcon' aria-hidden='true' /> :
    <i className='fa fa-play-circle playButton' style={{ fontSize: '2em' }} aria-hidden='true' />;

  return (
    <LazyFadeIn>
      <Card className='artist' onClick={handleClick}>
        <div className='artistBg' style={imageStyle} >
          {icon}
        </div>
        <CardBody>
          <CardText>
            <small className='text-muted'>
              {name}
            </small>
          </CardText>
        </CardBody>
      </Card>
    </LazyFadeIn>
  );
};

class Artists extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(name) {
    const { artists, played } = this.props;
    this.props.fetchVideos(artists[name], played);
  }
  render() {
    const { artists, selectedArtist } = this.props;

    if (Object.keys(artists).length > 0) {
      const preSort = Object.keys(artists).map(artist => ({ ...artists[artist] }));
      const sorted = preSort.sort((a, b) => b.relevance - a.relevance);
      const myArtists = sorted.map((artist, i) => {
        return (
          <Col lg='3' md='4' sm='6' xs='12' key={artist.name + i}>
            <Artist
              handleClick={() => this.handleClick(artist.name)}
              featured={selectedArtist && selectedArtist.artist.name === artist.name}
              {...artist}
            />
          </Col>
        );
      });

      return (
        <Container>
          <Row>
            {myArtists}
          </Row>
        </Container>
      );
    }

    return null;
  }
}


export default Artists;
