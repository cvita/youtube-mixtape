const fetchSpotifyAccessToken = () => (
  new Promise((resolve, reject) => {
    const request = '/spotify/token';
    fetch(request, { method: 'POST' })
      .then(res => res.json())
      .then(auth => resolve(addTokenExpirationTime(auth)))
      .catch(e => reject(e));
  })
);

const fetchInitialArtist = (artistName, token) => (
  new Promise((resolve, reject) => {
    const request = `https://api.spotify.com/v1/search?q='${artistName}&type=artist`;
    const options = { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };
    fetch(request, options)
      .then(res => res.json())
      .then(results => resolve(validateInitialArtist(artistName, results.artists.items)))
      .catch(e => reject(e));
  })
);

const determineSimilarArtists = (initialArtist, token, applyFilter) => (
  new Promise((resolve, reject) => {
    const similarArtists = [];
    const fetchRequests = initialArtist.genres.map(genre => (
      new Promise(resolve => {
        const request = `https://api.spotify.com/v1/search?q=%20genre:%22${genre}%22&type=artist&limit=50`;
        const options = { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };
        fetch(request, options)
          .then(res => res.json())
          .then(genreResults => {
            const filtered = filterByPrimaryGenres(initialArtist, genreResults.artists.items, applyFilter);
            if (filtered) {
              similarArtists.push(...filtered);
            }
            resolve();
          });
      }))
    );
    Promise.all(fetchRequests)
      .then(() => resolve(determineRelevance(similarArtists)))
      .catch(e => reject(e));
  })
);

// helper functions
const addTokenExpirationTime = token => (
  // `Expiration` is -1 minute for safety
  { expiration: (token.expires_in * 1000) + new Date().getTime() - 60000, ...token }
);

const validateInitialArtist = (artistName, artists) => {
  // Todo: Further normalization of comparison (i.e., remove punctuation)
  const validResult = artists.find(artist => artist.name.toLowerCase() === artistName.toLowerCase());
  if (!validResult) {
    throw new Error(`No results for ${artistName}`);
  }
  return validResult;
};

const filterByPrimaryGenres = (initialArtist, genreResults, applyFilter) => {
  if (!applyFilter) {
    return genreResults;
  }
  const initialArtistFound = genreResults.find(artist => artist.name.toLowerCase() === initialArtist.name.toLowerCase());
  if (initialArtistFound) {
    return genreResults;
  }
};

const determineRelevance = artists => {
  const unique = {};
  artists.forEach(artist => {
    if (!unique[artist.name]) { // Filter out duplicate `artist` objects
      unique[artist.name] = artist;
      unique[artist.name].relevance = 0;
    }
    unique[artist.name].relevance++; // Counts frequency of duplicate `artist` object
  });
  return unique;
};


export default {
  fetchSpotifyAccessToken,
  fetchInitialArtist,
  determineSimilarArtists,
};
