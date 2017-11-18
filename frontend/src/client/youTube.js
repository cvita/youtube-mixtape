const fetchVideos = (keywords, maxResults) => (
  new Promise((resolve, reject) => {
    const key = process.env.youTubeKey;
    const request = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${keywords}&regionCode=US&type=video&videoCategoryId=10&videoDuration=short&videoEmbedable=true&key=${key}`;
    fetch(request, { method: 'GET' })
      .then(resp => resp.json())
      .then(result => resolve(parseResponse(result.items)))
      .catch(e => reject(e));
  })
);

// helper functions
const parseResponse = videos => (
  videos.map(video => {
    return { id: video.id.videoId, ...video.snippet };
  })
)


export default {
  fetchVideos
};
