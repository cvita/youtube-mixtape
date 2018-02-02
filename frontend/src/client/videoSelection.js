// Todo: Add timestamp to selected video
// Todo: Make sure video id is not in blacklist (stored in DB). Compare ID's
const selectVideo = (artist, videos, played) => (
  new Promise((resolve, reject) => {
    const alreadyPlayed = played.filter(video => video.artist === artist.name).map(video => video.id);
    const unplayed = videos.filter(video => !alreadyPlayed.includes(video.id));
    const selectedVideo = unplayed.length > 0 ?
      unplayed[generateRandomIndex(unplayed)] :
      videos[generateRandomIndex(videos)];
    resolve(selectedVideo);
  })
);

// helper functions
const generateRandomIndex = array => (
  Math.floor(Math.random() * (array.length - 1))
);


export default {
  selectVideo
};
