"use strict";

function spotifyMethod(initialArtist) {
  var primaryGenres = [];
  determineArtistPrimaryGenres(initialArtist, primaryGenres);
}

function determineArtistPrimaryGenres(initialArtist, primaryGenres) {
  var urlPrefix = "https://api.spotify.com/v1/search?q=%20genre:%22";
  var forEachCount = 0;
  fullGenreList.forEach(function (genre) {
    $.getJSON(urlPrefix + genre + "%22&type=artist&limit=50")
      .done(function (genreResults) {
        var aPrimaryGenre = searchByGenreToFindInitialArtist(initialArtist, genre, genreResults);
        if (aPrimaryGenre !== undefined) {
          primaryGenres.push(aPrimaryGenre);
        }
        forEachCount++;
        if (forEachCount === fullGenreList.length) {
          findSimilarArtistsByGenreSearch(primaryGenres);
        }
      });
  });
}

function searchByGenreToFindInitialArtist(initialArtist, genre, spotifyData) {
  for (var i = 0; i < spotifyData.artists.items.length; i++) {
    var currentArtistResult = spotifyData.artists.items[i].name.toLowerCase();
    if (currentArtistResult === initialArtist) {
      return genre;
    }
  }
}

function findSimilarArtistsByGenreSearch(primaryGenres) {
  var urlPrefix = "https://api.spotify.com/v1/search?q=%20genre:%22";
  var forEachCount = 0;
  primaryGenres.forEach(function (genre) {
    $.getJSON(urlPrefix + genre + "%22&type=artist&limit=50")
      .done(function (genreResults) {
        for (var i = 0; i < genreResults.artists.items.length; i++) {
          var returnedArtistName = genreResults.artists.items[i].name.toLowerCase();
          similarArtistsSpotify.push(returnedArtistName);
        }
        forEachCount++;
        if (forEachCount === primaryGenres.length) {
          forEachCount = 0;
          similarArtistsSpotify = removeLessRelevantArtists(similarArtistsSpotify);
          displayResults(similarArtistsSpotify, 15, "Spotify genres"); // End of search!
        }
      });
  });
}

function removeLessRelevantArtists(array) {
  var frequency = {};
  array.forEach(function (artist) {
    frequency[artist] = 0;
  });

  var instanceOfArtist = array.filter(function (artist) {
    return ++frequency[artist] === 1;
  });

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
