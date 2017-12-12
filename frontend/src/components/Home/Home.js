import React from 'react';
import { Container, Jumbotron } from 'reactstrap';
import ArtistSearch from './ArtistSearch';


const Home = props => {
  return (
    <Container>
      <Jumbotron className='text-center'>
        <h1 className='display-3'>YouTube Mixtape</h1>

        <p className='lead'>Discover your new favorite artist.</p>
        <hr className='my-2' />
        <p className='text-muted'>Spotify artist and genre searches with YouTube video results</p>

        <div style={{ maxWidth: '35em', margin: '0 auto' }}>
          <ArtistSearch {...props} />
        </div>
      </Jumbotron>
    </Container>
  );
};


export default Home;
