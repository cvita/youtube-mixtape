
function getInitialArtistFullGenreListViaSpotify(initialArtist) {
  var searched = false;
  $.getJSON("https://api.spotify.com/v1/search?q=" + initialArtist + "&type=artist")
    .done(function (spotifyData) {
      if (spotifyData.artists.items.length === 0) {
        $(".nowPlaying").html("Unable to find " + initialArtist);
      } else {
        spotifyData.artists.items.forEach(function (artistResult) {
          if (artistResult.name.toLowerCase() === initialArtist) {
            if (!searched) {
              searched = true;
              similarArtists.results = [{
                "name": initialArtist,
                "frequency": 100,
                "artistImage": artistResult.images.find(function (image) {
                  return image.width > 500;
                })
              }]; // Ensures searchInput will display as first result
              similarArtists.artistPosition = 0;
              findAndPlayVideo(); // Begins playing first video while results complete
            }
            determineArtistPrimaryGenres(initialArtist, artistResult.genres);
          }
        });
      }
    })
    .fail(function () {
      $(".nowPlaying").html("Unable to find " + initialArtist + "(Initial api call failed)");
    });
}


function determineArtistPrimaryGenres(initialArtist, fullGenreList) {
  var primaryGenres = [];
  var forEachCount = 0;
  fullGenreList.forEach(function (genre) {
    $.getJSON("https://api.spotify.com/v1/search?q=%20genre:%22" + genre + "%22&type=artist&limit=50")
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
  var forEachCount = 0;
  primaryGenres.forEach(function (genre) {
    $.getJSON("https://api.spotify.com/v1/search?q=%20genre:%22" + genre + "%22&type=artist&limit=50")
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
                "artistImage": aSimilarArtist.images.find(function (image) {
                  return image.height < 600;
                })
              });
            }
          }
        }
        forEachCount++;
        if (forEachCount === primaryGenres.length) {
          sortSimilarArtistsByFrequency();
        }
      });
  });
}

function sortSimilarArtistsByFrequency() {
  similarArtists.results = similarArtists.results.sort(function (a, b) {
    return b.frequency - a.frequency;
  });
  similarArtists.results = similarArtists.results.slice(0, 100);
  displayResults();
  highLightCurrentArtistButton();
}
