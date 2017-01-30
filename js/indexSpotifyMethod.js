"use strict";

var similarArtistsSpotify;

function getInitialArtistFullGenreList(initialArtist) {
  var urlPrefix = "https://api.spotify.com/v1/search?q="
  $.getJSON(urlPrefix + initialArtist + "&type=artist")
    .done(function (spotifyData) {
      if (spotifyData.artists.items.length === 0) {
        $(".nowPlaying").html("Unable to find " + initialArtist);
      } else {
        spotifyData.artists.items.forEach(function (artistResult) {
          if (artistResult.name.toLowerCase() === initialArtist) {
            fullGenreList = artistResult.genres;
            determineArtistPrimaryGenresSpotifyMethod(initialArtist, fullGenreList);
          }
        });
      }
    })
    .fail(function () {
      $(".nowPlaying").html("Unable to find " + initialArtist + "(Initial api call failed)");
    });
}

function determineArtistPrimaryGenresSpotifyMethod(initialArtist, fullGenreList) {
  similarArtistsSpotify = [];
  var primaryGenres = [];
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
          var aSimilarArtist = genreResults.artists.items[i].name.toLowerCase();
          similarArtistsSpotify.push(aSimilarArtist);
        }
        forEachCount++;
        if (forEachCount === primaryGenres.length) {
          removeLessRelevantArtists(similarArtistsSpotify);
        }
      });
  });
}

function removeLessRelevantArtists(resultsArray) {
  var frequency = {};
  resultsArray.forEach(function (artist) {
    frequency[artist] = 0;
  });

  var instanceOfArtist = resultsArray.filter(function (artist) {
    return ++frequency[artist] === 1;
  });

  similarArtistsSpotify = instanceOfArtist.filter(function (val) {
    return frequency[val] > 3; // Significantly affects number of results
  });
  similarArtistsSpotify = sortSimilarArtistsByFrequency(similarArtistsSpotify, frequency);

  if (similarArtistsSpotify.length > 15) {
    allResults = similarArtistsSpotify;
    displayResults(allResults);
  } else {
    combineSpotifyAndAutoSuggestionResults(similarArtistsSpotify);
    console.log("Under 15 results from spotify method, so now querying autoSuggestionMethod");
    autoSuggestionMethod(initialArtist);
  }
}

function sortSimilarArtistsByFrequency(resultsArray, frequency) {
  return resultsArray.sort(function (a, b) {
    return frequency[b] - frequency[a];
  });
}
