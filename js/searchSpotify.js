"use strict";

function runSpotifySearch(searchInput) {
  getInitialArtistFullGenreListViaSpotify(searchInput).then(function (result) {
    findAndPlayVideo(); // Located in search.js
    return determineArtistPrimaryGenres(result);
  }).then(function (result) {
    return findSimilarArtistsByGenreSearch(result);
  }).then(function () {
    return sortSimilarArtistsByFrequency();
  }).then(function () {
    displayResults();
  });
}

function getInitialArtistFullGenreListViaSpotify(initialArtist) {
  return new Promise(function (resolve, reject) {
    $.getJSON("https://api.spotify.com/v1/search?q=" + initialArtist + "&type=artist")
      .fail(function () {
        var failMessage = "Unable to find " + initialArtist + "(Initial api call failed)";
        $(".nowPlaying").html(failMessage);
        reject(failMessage);
      })
      .done(function (spotifyData) {
        if (spotifyData.artists.items.length === 0) {
          $(".nowPlaying").html("Unable to find results for " + initialArtist);
        } else {
          var validArtist = spotifyData.artists.items.find(function (artistResult) {
            return artistResult.name.toLowerCase() === initialArtist;
          });
          if (!validArtist) {
            validArtist = spotifyData.artists.items[0];
            similarArtists.results[0].name = validArtist.name.toLowerCase();
          }
          similarArtists.results[0].artistImage = validArtist.images[0];
          resolve(validArtist.genres);
        }
      });
  });
}


function determineArtistPrimaryGenres(fullGenreList) {
  return new Promise(function (resolve, reject) {
    var primaryGenres = [];
    var forEachCount = 0;
    fullGenreList.forEach(function (genre) {
      $.getJSON("https://api.spotify.com/v1/search?q=%20genre:%22" + genre + "%22&type=artist&limit=50")
        .fail(function () {
          reject("Unable to determineArtistPrimaryGenres");
        })
        .done(function (genreResults) {
          var aPrimaryGenre = searchByGenreToFindInitialArtist(similarArtists.results[0].name, genre, genreResults);
          if (aPrimaryGenre !== undefined) {
            primaryGenres.push(aPrimaryGenre);
          }
          forEachCount++;
          if (forEachCount === fullGenreList.length) {
            resolve(primaryGenres);
          }
        });
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
  return new Promise(function (resolve, reject) {
    var forEachCount = 0;
    primaryGenres.forEach(function (genre) {
      $.getJSON("https://api.spotify.com/v1/search?q=%20genre:%22" + genre + "%22&type=artist&limit=50")
        .fail(function () {
          reject("Unable to findSimilarArtistsByGenreSearch for the genre " + genre);
        })
        .done(function (genreResults) {
          for (var i = 0; i < genreResults.artists.items.length; i++) {
            var aSimilarArtist = genreResults.artists.items[i];

            for (var j = 0; j < similarArtists.results.length; j++) {
              if (similarArtists.results[j].name === aSimilarArtist.name.toLowerCase()) {
                similarArtists.results[j].frequency++;
                break;
              } else if (j === similarArtists.results.length - 1) {
                similarArtists.results.push({
                  "name": aSimilarArtist.name.toLowerCase(),
                  "frequency": 1,
                  "artistImage": aSimilarArtist.images[0]
                });
              }
            }
          }
          forEachCount++;
          if (forEachCount === primaryGenres.length) {
            resolve();
          }
        });
    });
  });
}


function sortSimilarArtistsByFrequency() {
  return new Promise(function (resolve, reject) {
    similarArtists.results = similarArtists.results.sort(function (a, b) {
      return b.frequency - a.frequency;
    });
    similarArtists.results = similarArtists.results.slice(0, 100);
    if (similarArtists.results.length === 1) {
      reject("similarArtists.results.length is === 1, which implies the spotify searches failed");
    } else {
      resolve();
    }
  });
}
