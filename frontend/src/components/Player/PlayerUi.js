import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import './PlayerUi.css';


const PlayerUi = props => {
  const { playerCollapsed, playerState, onClick } = props;
  const { artist, video } = props.selectedArtist;

  const playPauseAction = playerState === 1 ? 'pause' : 'play';
  const playPauseIcon = playerState === 1 || playerState === 2 ? playPauseAction : 'cog fa-spin';

  const title = video.title
    .replace(artist.name, '')
    .replace('-', '')
    .trim();

  return (
    <Container>
      <Row>
        <Col lg='2' md='3' sm='4' xs='12'>
          {playerCollapsed && (
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
            <button className='fa fa-step-backward' onClick={() => onClick('previous')} />
            <button className='fa fa-fast-backward' onClick={() => onClick('fastRewind')} />
            <button className={`fa fa-${playPauseIcon}`} onClick={() => onClick(playPauseAction)} id='playPause' />
            <button className='fa fa-fast-forward' onClick={() => onClick('fastForward')} />
            <button className='fa fa-step-forward' onClick={() => onClick('next')} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};


export default PlayerUi;
