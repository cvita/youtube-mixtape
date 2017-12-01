// Todo: Add timestamp to selected video
// Todo: Make sure video id is not in blacklist (stored in DB). Compare ID's
const selectVideo = (youTubeSearchResult, played) => (
  new Promise((resolve, reject) => {
    const { artist, videos } = youTubeSearchResult;
    const alreadyPlayed = played[artist.name].map(video => video.id);
    const unplayed = videos.filter(video => !alreadyPlayed.includes(video.id));
    const selectedVideo = unplayed.length > 0 ?
      unplayed[generateRandomIndex(unplayed)] :
      videos[generateRandomIndex(videos)]; // Todo: Make new call to YouTube (w/ offset) for more videos

    resolve({ artist, video: selectedVideo });
  })
);

// helper functions
const generateRandomIndex = array => (
  Math.floor(Math.random() * (array.length - 1))
);


export default {
  selectVideo
};
