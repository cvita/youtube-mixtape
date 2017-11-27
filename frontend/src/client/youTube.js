const fetchVideos = (keywords, maxResults) => (
  new Promise((resolve, reject) => {
    const key = 'AIzaSyAxXnGEhkkZmEh7zfugJpAsJ7kpSU4GbDc'; // Restricted usage
    const request = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${keywords}&regionCode=US&type=video&videoCategoryId=10&videoDuration=short&videoEmbedable=true&key=${key}`;
    fetch(request, { method: 'GET' })
      .then(resp => resp.json())
      .then(result => resolve({ artist: keywords, videos: parseResponse(result.items) }))
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
