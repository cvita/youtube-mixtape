"use strict";

var resultsArray;
var validateAsArtistSearchCount = 0;

function autoSuggestionMethod(initialArtist) {
  var conjunctionSearchList = ["vs", "and", "with", "sounds like", "influenced by"];
  initialSearchKeyword = initialArtist;
  resultsArray = [initialSearchKeyword];
  validateAsArtistSearchCount = 0;
  conjunctionSearchList.forEach(function (conjunction) {
    suggestQueries(initialSearchKeyword, 0, conjunction);;
  });
}

function suggestQueries(searchKeyword, apiDataIndex, conjunction) {
  var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
  $.getJSON(apiURL + searchKeyword + " " + conjunction)
    .done(function (apiData) {
      var returnedResult = validateResult(apiData[1][apiDataIndex], conjunction);
      resultsArray.push(returnedResult);
      if (resultsArray.find(duplicateCheck) === undefined) {
        suggestQueries(returnedResult, 0, conjunction);
      } else {
        resultsArray.pop();
        if (apiDataIndex < apiData[1].length) {
          apiDataIndex++;
          suggestQueries(initialSearchKeyword, apiDataIndex, conjunction);
        }
      }
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
    return initialSearchKeyword; // Creates condition, which starts a new search
  }
}

function duplicateCheck(val, pos) {
  return resultsArray.indexOf(val) !== pos;
}

function validateAsArtist(keyword) {
  $.getJSON("https://api.spotify.com/v1/search?q=" + keyword + "&type=artist&limit=50")
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
      validateAsArtistSearchCount++;
      if (validateAsArtistSearchCount === resultsArray.length) {
        orderArtistsByFrequencyOfCommonGenres(similarArtistsGoogle);
      }
    });
}

function Artist(artist, array) {
  this.artistName = artist;
  this.commonGeneres = array.length;
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
  console.log("Google: " + similarArtistsGoogle);
  $("body").append("<br><b>Google:</b> " + similarArtistsGoogle);
}
