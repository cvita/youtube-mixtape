const initialState = {
  styleSheetLoaded: false,
  spotifyAccess: null,
  artists: {},
  sortedArtists: [],
  selectedArtist: null,
  played: {},
  player: { playerState: null, duration: 0, elapsed: 0 },
  errors: { recent: null, all: [] }
};


export default initialState;
