"use strict";

var similarArtistsGoogle = [];
var conjunctionSearchList = ["vs", "and", "with"]; // Try adding "sounds like", "was influenced by"
var resultsArray;
var conjunctionSearchCount;
var apiDataIndexCount = 0;

function autoSuggestionMethod(initialArtist) {
  conjunctionSearchCount = 0;
  initialSearchKeyword = initialArtist;
  resultsArray = [initialSearchKeyword];
  conjunctionSearchList.forEach(function (conjunction) {
    runGoogleSearch(conjunction);
  });
}

function runGoogleSearch(conjunction) {
  getInitialArtistFullGenreList(initialSearchKeyword, function () {
    suggestQueries(initialSearchKeyword, 0);
  });

  function suggestQueries(searchKeyword, apiDataIndex) {
    var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
    $.getJSON(apiURL + searchKeyword + " " + conjunction, function (apiData) {
      var returnedResult = validateResult(apiData[1][apiDataIndex]);
      resultsArray.push(returnedResult);

      if (resultsArray.find(duplicateCheck) === undefined) {
        suggestQueries(returnedResult, 0);
      } else {
        resultsArray.pop();
        if (apiDataIndexCount < apiData[1].length) {
          apiDataIndexCount++;
          suggestQueries(initialSearchKeyword, apiDataIndexCount);
        } else {
          conjunctionSearchCount++

          if (conjunctionSearchCount === conjunctionSearchList.length) {
            var spotifySearch = setInterval(querySpotify, 50); // Allowing for slow response from spotify
            var resultsArrayIndex = 0;

            function querySpotify() {
              validateAsArtist(resultsArray[resultsArrayIndex]);
              resultsArrayIndex++;
              if (resultsArrayIndex === resultsArray.length) {
                clearInterval(spotifySearch);
                orderArtistsByFrequencyOfCommonGenres(similarArtistsGoogle);
              }
            }

          }
        }
      }
    });
  }

  function validateResult(result) {
    result += "";
    var conjunctionPosition = result.indexOf(" " + conjunction + " ");
    if (conjunctionPosition !== -1) {
      result = result.slice(conjunctionPosition + conjunction.length + 2, result.length);
      return result;
    } else {
      return initialSearchKeyword; // Creates condition, which starts a new search
    }
  }

  function duplicateCheck(val, pos) {
    return resultsArray.indexOf(val) !== pos;
  }
}

function validateAsArtist(keyword) { // Try setTimeout or remove callback if this doesn't work
  $.getJSON("https://api.spotify.com/v1/search?q=" + keyword + "&type=artist&limit=50", function (spotifyData) {
    if (spotifyData.artists.items.length > 0) {
      //console.log(keyword);
      spotifyData.artists.items.forEach(function (spotifyArtistResult) {
        var artistName = spotifyArtistResult.name.toLowerCase();
        if (artistName === keyword && spotifyArtistResult.popularity > 1) {
          var commonGeneres = fullGenreList.filter(function (genre) {
            return spotifyArtistResult.genres.indexOf(genre) !== -1;
          });
          if (commonGeneres.length > 0) {
            var similarArtist = new Artist(keyword, commonGeneres);
            similarArtistsGoogle.push(similarArtist);
           // console.log(similarArtist);
          }
        }
      });
    }
  });
}

function Artist(artist, array) {
  this.artistName = artist;
  this.commonGeneres = array.length;
}

function orderArtistsByFrequencyOfCommonGenres(array) {
  var sortedArray = array.sort(function (a, b) {
    return b.commonGeneres - a.commonGeneres;
  });
  similarArtistsGoogle = [];
  sortedArray.forEach(function (artistObj) {
    if (similarArtistsGoogle.indexOf(artistObj.artistName) === -1) {
      similarArtistsGoogle.push(artistObj.artistName);
    }
  });
  console.log("Google: " + similarArtistsGoogle);
}

// BUG: "sonic youth" doesn't return results, but has results in resultsArray