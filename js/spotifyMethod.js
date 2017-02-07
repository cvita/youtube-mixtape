
var similarArtistsSpotify;

function getInitialArtistFullGenreListViaSpotify(initialArtist) {
  var urlPrefix = "https://api.spotify.com/v1/search?q="
  $.getJSON(urlPrefix + initialArtist + "&type=artist")
    .done(function (spotifyData) {
      if (spotifyData.artists.items.length === 0) {
        $(".nowPlaying").html("Unable to find " + initialArtist);
      } else {
        spotifyData.artists.items.forEach(function (artistResult) {
          if (artistResult.name.toLowerCase() === initialArtist) {
            fullGenreList = artistResult.genres;
            determineArtistPrimaryGenres(initialArtist, fullGenreList);
          }
        });
      }
    })
    .fail(function () {
      $(".nowPlaying").html("Unable to find " + initialArtist + "(Initial api call failed)");
    });
}

function determineArtistPrimaryGenres(initialArtist, fullGenreList) {
  similarArtistsSpotify = [{ "name": initialArtist, "frequency": 100 }]; // Ensures initialArtist will display as first result
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

          for (var j = 0; j < similarArtistsSpotify.length; j++) {
            if (similarArtistsSpotify[j].name === aSimilarArtist) {
              similarArtistsSpotify[j].frequency++;
              break;
            } else if (j === similarArtistsSpotify.length - 1) {
              similarArtistsSpotify.push({ "name": aSimilarArtist, "frequency": 1 });
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
  similarArtistsSpotify = similarArtistsSpotify.sort(function (a, b) {
    return b.frequency - a.frequency;
  });
  similarArtistsSpotify = similarArtistsSpotify.slice(0, 100);
  beginPlayingFirstVideo(similarArtistsSpotify);
}
