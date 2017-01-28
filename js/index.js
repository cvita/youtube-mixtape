"use strict";

var initialArtist;
var fullGenreList;
var similarArtistsSpotify;
var similarArtistsGoogle;

function runSearch() {
  fullGenreList = [];
  similarArtistsSpotify = [];
  similarArtistsGoogle = [];
  initialArtist = document.getElementById("initialSearchInput").value.toLowerCase();
  getInitialArtistFullGenreList(initialArtist);
}

function getInitialArtistFullGenreList(initialArtist) {
  var urlPrefix = "https://api.spotify.com/v1/search?q="
  $.getJSON(urlPrefix + initialArtist + "&type=artist")
    .done(function (spotifyData) {
      if (spotifyData.artists.items.length === 0) {
        console.log("Unable to find " + initialArtist);
      } else {
        spotifyData.artists.items.forEach(function (artistResult) {
          if (artistResult.name.toLowerCase() === initialArtist) {
            fullGenreList = artistResult.genres;
            autoSuggestionMethod(initialArtist);
            spotifyMethod(initialArtist);
          }
        });
      }
    })
    .fail(function () {
      console.log("Initial request for " + initialArtist + " to the Spotify api failed");
    });
}

function displayResults(resultsArray, limit, methodUsed) {
  if (resultsArray[0] === initialArtist) {
    resultsArray.shift();
  }
  if (resultsArray.length > limit) {
    console.log("sliced to " + limit);
    resultsArray = resultsArray.slice(0, limit);
  }
  $(".allSearchResults").append('<br><span style="color:#7ca9be;">' + methodUsed + '</span><br>');

  resultsArray.forEach(function (result) {
    $(".allSearchResults").append('<button class="btn-link"><li class="individualResult">' + result + '</li></button>');
  });
  $(".individualResult").click(function () {
    initialSearchInput.value = $(this).html();
    clearDisplayedResults();
    runSearch();
  });
}

function clearDisplayedResults() {
  $(".searchedFor").html("");
  $(".allSearchResults").html("");
  $(".numberOfResultsFound").html("");
}

$(".searchBtn").click(function () {
  runSearch();
  this.blur();
});

$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    runSearch();
    this.blur();
  }
});

$("#initialSearchInput").click(function () {
  initialSearchInput.value = "";
  clearDisplayedResults();
});

function promptUserToCreateYouTubePlaylist(makePlaylistFrom) {
  $(".allSearchResults").append("<br><button class='createPlaylist btn btn-info'>Create this playlist</button>");
  $(".createPlaylist").click(function () {
    $(this).addClass("disabled");
    $(this).html("Now creating your playlist...");
    searchArrayOfArtists(makePlaylistFrom);
  });
}

// Roughing in an idea for an in-page video player, which will stream the playlist programatically
var currentVideoID = "OTdkHV9YsIk";

var videoToPlay = {
  "video": {
    "value": "<iframe title='YouTube video player' type='text/html' width='640' height='390' src='http://www.youtube.com/embed/" + currentVideoID + "' frameborder='0' allowFullScreen></iframe>"
  }
}

$(".videoPlayer").html(videoToPlay.video.value);

// BUG: clicking search after results are already displayed, will duplicate displayed results.
// BUG: Shouldn't be able to search a blank initialSearchKeyord