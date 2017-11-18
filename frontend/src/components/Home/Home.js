import React from 'react';
import ArtistSearch from './ArtistSearch';
import YouTubePlayer from '../Player/YouTubePlayer';
import { Row, Col } from 'reactstrap';

const Home = props => {
  return (
    <div>
      <Row>
        <Col>
          <ArtistSearch {...props} />
        </Col>
      </Row>

      <Row>
        <Col>
          <YouTubePlayer {...props} />
        </Col>
      </Row>
    </div>
  );
};


export default Home;
