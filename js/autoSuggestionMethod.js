"use strict";


var allGoogleResults;
var similarArtistsGoogle;
var conjunctionSearchList = ["vs", "with", "sounds like", "and", "influenced by"]; //  "with", "sounds like", "and", "influenced by"
var conjunctionSearchCompletedCount = 0;
var validating;


function autoSuggestionMethod(initialArtist) {
  allGoogleResults = [initialArtist];
  similarArtistsGoogle = [];
  conjunctionSearchCompletedCount = 0;
  conjunctionSearchList.forEach(function (conjunction) {
    suggestQueries(initialArtist, 0, conjunction);;
  });
}

function suggestQueries(searchKeyword, apiDataIndex, conjunction) {
  var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
  $.getJSON(apiURL + searchKeyword + " " + conjunction)
    .done(function (apiData) {
      var returnedResult = validateResult(apiData[1][apiDataIndex], conjunction);
      allGoogleResults.push(returnedResult);
      if (allGoogleResults.find(duplicateCheck) === undefined) {
        suggestQueries(returnedResult, 0, conjunction);
      } else {
        allGoogleResults.pop();
        if (apiDataIndex < apiData[1].length) {
          apiDataIndex++;
          suggestQueries(initialArtist, apiDataIndex, conjunction);
        } else {
          conjunctionSearchCompletedCount++;
          if (conjunctionSearchCompletedCount === conjunctionSearchList.length) {
            ensureSearchesAreOver();
          }
        }
      }
    })
    .fail(function () {
      console.log("Request for " + searchKeyword + " to the Google's auto-suggestion api failed");
    });
}

function validateResult(result, conjunction) {
  result += "";
  var conjunctionPosition = result.indexOf(" " + conjunction + " ");
  if (conjunctionPosition !== -1) {
    result = result.slice(conjunctionPosition + conjunction.length + 2, result.length);
    validateAsArtist(result);
    return result;
  } else {
    return initialArtist; // Creates condition, which starts a new search
  }
}

function duplicateCheck(val, pos) {
  return allGoogleResults.indexOf(val) !== pos;
}

function validateAsArtist(keyword) {
  validating = true;
  $.getJSON("https://api.spotify.com/v1/search?q=" + keyword + "&type=artist&limit=20") // Changing limit to avoid 429 error
    .done(function (spotifyData) {
      if (spotifyData.artists.items.length > 0) {
        spotifyData.artists.items.forEach(function (spotifyArtistResult) {
          var artistName = spotifyArtistResult.name.toLowerCase();
          if (artistName === keyword && spotifyArtistResult.popularity > 1) {
            var commonGeneres = fullGenreList.filter(function (genre) {
              return spotifyArtistResult.genres.indexOf(genre) !== -1;
            });
            if (commonGeneres.length > 0) {
              var similarArtist = new Artist(keyword, commonGeneres);
              similarArtistsGoogle.push(similarArtist);
            }
          }
        });
      }
      validating = false;
    })
    .fail(function () {
      console.log("validateAsArtist() for " + keyword + " failed");
      validating = false;
    });
}

function Artist(artist, array) {
  this.artistName = artist;
  this.commonGeneres = array.length;
}


function ensureSearchesAreOver() {
  if (!validating) {
    orderArtistsByFrequencyOfCommonGenres(similarArtistsGoogle);
  } else {
    console.log("Now delaying ensureSearchesAreOver()");
    setTimeout(ensureSearchesAreOver, 0);
  }
}

function orderArtistsByFrequencyOfCommonGenres(array) {
  var sortedTempArray = array.sort(function (a, b) {
    return b.commonGeneres - a.commonGeneres;
  });

  similarArtistsGoogle = [];
  sortedTempArray.forEach(function (artistObj) {
    if (similarArtistsGoogle.indexOf(artistObj.artistName) === -1) {
      similarArtistsGoogle.push(artistObj.artistName);
    }
  });
  console.log(similarArtistsGoogle);
  combineSpotifyAndAutoSuggestionResults(similarArtistsGoogle); // End of search!
}
