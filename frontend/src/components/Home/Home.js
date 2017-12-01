import React from 'react';
import ArtistSearch from './ArtistSearch';
import { Row, Col } from 'reactstrap';

const Home = props => {
  return (
    <div style={{ marginBottom: '6em' }}>
      <Row>
        <Col>
          <ArtistSearch {...props} />
        </Col>
      </Row>
    </div>
  );
};


export default Home;
