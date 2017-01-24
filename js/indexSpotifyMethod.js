"use strict";

function spotifyMethod(initialArtist) {
  initialArtist = initialArtist.toLowerCase();
  var primaryGenres = [];
  similarArtists = [];
  getInitialArtistFullGenreList(initialArtist, function () {
    determineArtistPrimaryGenres(initialArtist, primaryGenres, function () {
      findSimilarArtistsByGenreSearch(primaryGenres, function () {
        similarArtists = removeLessRelevantArtists(similarArtists);
        console.log("Spotify: " + similarArtists);
      });
    });
  });
}

function determineArtistPrimaryGenres(initialArtist, primaryGenres, callback) {
  if (fullGenreList.length > 0) {
    var urlPrefix = "https://api.spotify.com/v1/search?q=%20genre:%22";
    fullGenreList.forEach(function (genre) {
      $.getJSON(urlPrefix + genre + "%22&type=artist&limit=50", function (genreResults) {
        var aPrimaryGenre = searchByGenreToFindInitialArtist(initialArtist, genre, genreResults);
        if (aPrimaryGenre !== undefined) {
          primaryGenres.push(aPrimaryGenre);
        }
      });
    });
  }
  setTimeout(callback, 1000);
}

function searchByGenreToFindInitialArtist(initialArtist, genre, spotifyData) {
  for (var i = 0; i < spotifyData.artists.items.length; i++) {
    var currentArtistResult = spotifyData.artists.items[i].name.toLowerCase();
    if (currentArtistResult === initialArtist) {
      return genre;
    }
  }
}

function findSimilarArtistsByGenreSearch(primaryGenres, callback) {
  var urlPrefix = "https://api.spotify.com/v1/search?q=%20genre:%22";
  primaryGenres.forEach(function (genre) {
    $.getJSON(urlPrefix + genre + "%22&type=artist&limit=50", function (genreResults) {
      for (var i = 0; i < genreResults.artists.items.length; i++) {
        var returnedArtistName = genreResults.artists.items[i].name.toLowerCase();
        similarArtists.push(returnedArtistName);
      }
    });
  });
  setTimeout(callback, 500);
}

function removeLessRelevantArtists(array) {
  var frequency = {};
  array.forEach(function (artist) {
    frequency[artist] = 0;
  });

  var instanceOfArtist = array.filter(function (artist) {
    return ++frequency[artist] === 1;
  });
  // base freq cutoff of length of similar artists
  instanceOfArtist = instanceOfArtist.filter(function (val) {
    return frequency[val] > 2; // Significantly affects number of results
  });

  return sortSimilarArtistsByFrequency(instanceOfArtist, frequency);
}

function sortSimilarArtistsByFrequency(array, frequency) {
  return array.sort(function (a, b) {
    return frequency[b] - frequency[a];
  });
}
