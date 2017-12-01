import stringSimilarity from 'string-similarity';


const fetchVideos = (artist, played, maxResults) => (
  new Promise((resolve, reject) => {
    if (artist.videos) {
      return handleDuplicateSearches(artist, resolve);
    }
    const key = 'AIzaSyAxXnGEhkkZmEh7zfugJpAsJ7kpSU4GbDc'; // Restricted usage
    const request = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${artist.name}&regionCode=US&type=video&videoCategoryId=10&videoDuration=short&videoEmbedable=true&key=${key}`;
    fetch(request, { method: 'GET' })
      .then(res => res.json())
      .then(res => {
        const videos = removeDuplicateSongs(artist.name, res.items);
        resolve({ artist, videos });
      })
      .catch(e => reject(e));
  })
);

// helper functions
const handleDuplicateSearches = (artist, resolve) => {
  console.log(`Returning previously fetched video results for ${artist.name}`);
  resolve({ artist, videos: artist.videos });
};

const removeDuplicateSongs = (artistName, videos, similarityThreshold = 0.32) => {
  const uniqueVideos = [];
  const duplicates = [];
  const titles = videos.map(video => normalizeTitle(artistName, video.snippet.title));

  for (let i = 0; i < videos.length; i++) {
    const currentTitle = titles[i];
    if (duplicates.includes(currentTitle)) {
      continue;
    }
    const otherTitles = titles.filter(title => title !== currentTitle);
    const similarity = stringSimilarity.findBestMatch(currentTitle, otherTitles).bestMatch;
    // accept one of each song
    uniqueVideos.push({ id: videos[i].id.videoId, ...videos[i].snippet });
    // don't accept the duplicate song
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
