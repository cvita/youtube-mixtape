import videoSelection from '../videoSelection';
import youTubeSearchResults from './stubData/youTubeSearchResults.json'
import played from './stubData/played.json';


describe('videoSelection:', () => {
  it('should return `artist` and `video` objects', () => {
    return videoSelection.selectVideo(youTubeSearchResults, played)
      .then(res => {
        expect(res.artist).toBeInstanceOf(Object);
        expect(res.video).toBeInstanceOf(Object);
      });
  });

  it('should handle an empty array as `played` argument', () => {
    return videoSelection.selectVideo(youTubeSearchResults, [])
      .then(res => {
        expect(res.artist).toBeInstanceOf(Object);
        expect(res.video).toBeInstanceOf(Object);
      });
  });
});
