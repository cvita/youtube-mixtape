import stringSimilarity from 'string-similarity';
import blacklist from './blacklist';


const fetchVideos = (artist, played, maxResults) => (
  new Promise((resolve, reject) => {
    if (artist.videos) {
      console.log(`Returning previously fetched video results for ${artist.name}`);
      return resolve({ videos: artist.videos, youTubeNextPageToken: artist.youTubeNextPageToken });
    }
    Promise.all([
      fetchYouTube(artist, played, maxResults),
      blacklist.fetchBlacklistedVideos(artist)
    ])
      .then(results => {
        const videos = removeBlacklistedAndDuplicates(artist.name, results[0], results[1]);
        resolve({ videos, youTubeNextPageToken: results[0].nextPageToken });
      });
  })
);

const fetchYouTube = (artist, played, maxResults) => ( // turn multiple parameters into an object
  new Promise((resolve, reject) => {
    const key = 'AIzaSyAxXnGEhkkZmEh7zfugJpAsJ7kpSU4GbDc'; // Restricted usage
    let request = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(artist.name)}&regionCode=US&type=video&videoCategoryId=10&videoDuration=short&videoEmbedable=true&key=${key}`;
    if (artist.youTubeNextPageToken) request += `&pageToken=${artist.youTubeNextPageToken}`;
    fetch(request, { method: 'GET' })
      .then(res => res.json())
      .then(res => resolve(res))
      .catch(e => reject(e));
  })
);

// helper functions
const removeBlacklistedAndDuplicates = (artistName, youTubeResponse, blacklist, downvotesThreshold = 2, similarityThreshold = 0.32) => {
  const videos = youTubeResponse.items;
  const titles = videos.map(video => normalizeTitle(artistName, video.snippet.title));
  const uniqueVideos = [];
  const duplicates = [];

  for (let i = 0; i < videos.length; i++) {
    // Remove any blacklisted videos from results
    const currentId = videos[i].id.videoId;
    const blacklistIndex = blacklist.findIndex(doc => doc._id === currentId);
    if (blacklistIndex !== -1 && blacklist[blacklistIndex].downvotes > downvotesThreshold) {
      continue;
    }
    const currentTitle = titles[i];
    if (duplicates.includes(currentTitle)) {
      continue;
    }
    const otherTitles = titles.filter(title => title !== currentTitle);
    const similarity = stringSimilarity.findBestMatch(currentTitle, otherTitles).bestMatch;
    // Accept one of each song
    uniqueVideos.push({ id: currentId, ...videos[i].snippet });
    // Don't accept the duplicate song
    if (similarity.rating > similarityThreshold) {
      duplicates.push(similarity.target);
    }
  }

  return uniqueVideos;
};

const normalizeTitle = (artistName, title) => (
  // Todo: Consider regExp instead of multiple `.replace()`
  title
    .toLowerCase()
    .replace(artistName.toLowerCase(), '')
    .replace('lyrics', '') // Remove generic keywords, which could obfuscate actual similarity
    .replace('song', '')
    .replace('album', '')
    .trim()
);

export default {
  fetchVideos
};
