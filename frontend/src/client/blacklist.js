const addToBlacklist = (artist, video) => (
  new Promise((resolve, reject) => {
    const request = '/blacklist';
    const init = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        artistName: artist.name,
        videoId: video.id,
        channelId: video.channelId,
        title: video.title
      })
    };
    fetch(request, init)
      .then(res => res.json())
      .then(res => resolve(res))
      .catch(e => reject(e));
  })
);


export default {
  addToBlacklist
};
