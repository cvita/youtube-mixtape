import React, { Component } from 'react';
import LazyFadeIn from '../helper/LazyFadeIn';
import { Container, Row, Col, Card, CardText, CardBody } from 'reactstrap';
import './Artists.css';


const Artist = props => {
  const { name, images, handleClick } = props;
  const size = window.innerWidth > 500 ? 1 : 2; // Request appropriate image size
  const imageStyle = {
    background: `url(${images[size].url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <LazyFadeIn>
      <Card className='artist' onClick={handleClick}>
        <div className='artistBg' style={imageStyle} >
          <i className='fa fa-play-circle playButton' style={{ fontSize: '2em' }} aria-hidden='true' />
        </div>
        <CardBody>
          <CardText>
            <small className='text-muted'>{name}</small>
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
    const { artists } = this.props;
    if (!artists[name].videos) { // Prevent redundant searches
      this.props.fetchVideos(name);
    }
  }
  render() {
    const { artists } = this.props;

    if (Object.keys(artists).length > 0) {
      const preSort = Object.keys(artists).map(artist => ({ ...artists[artist] }));
      const sorted = preSort.sort((a, b) => b.relevance - a.relevance);
      const myArtists = sorted.map((artist, i) => {
        return (
          <Col lg='3' md='4' sm='6' xs='12' key={artist.name + i}>
            <Artist handleClick={() => this.handleClick(artist.name)} {...artist} />
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
