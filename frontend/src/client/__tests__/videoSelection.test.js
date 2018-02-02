import videoSelection from '../videoSelection';
import videos from './stubData/youTubeSearchResults.json'
import artist from './stubData/artist.json';
import played from './stubData/played.json';


describe('videoSelection:', () => {
  it('should return `artist` and `video` objects', () => {
    return videoSelection.selectVideo(artist, videos, played)
      .then(res => {
        expect(res).toBeInstanceOf(Object);
      });
  });

  it('should handle an empty array as `played` argument', () => {
    return videoSelection.selectVideo(artist, videos, [])
      .then(res => {
        expect(res).toBeInstanceOf(Object);
      });
  });
});
