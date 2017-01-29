"use strict";

var initialArtist;
var fullGenreList;
var similarArtistsSpotify;
var similarArtistsGoogle;
var currentVideo;

function runSearch() {
  fullGenreList = [];
  similarArtistsSpotify = [];
  similarArtistsGoogle = [];
  initialArtist = document.getElementById("initialSearchInput").value.toLowerCase();
  getInitialArtistFullGenreList(initialArtist);
  $(".subheading").slideUp("fast");
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
            //autoSuggestionMethod(initialArtist);
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

  searchArrayOfArtists(resultsArray);
  beginPlayingFromResults();
}

function beginPlayingFromResults() {
  if (videosForPlaylist.length === 0) {
    console.log("waiting for video results...");
    setTimeout(beginPlayingFromResults, 0);
  } else {
    currentVideo = videosForPlaylist[0];
    if (!player) {
      prepareYouTubePlayer();
    } else {
      player.loadVideoById(currentVideo);
    }
  }
}

$(".nextVideoBtn").click(function () {
  queNextVideo();
});

function queNextVideo() {
  var nextVideoIndex = videosForPlaylist.indexOf(currentVideo) + 1;
  if (nextVideoIndex < currentVideo.length) {
    currentVideo = videosForPlaylist[nextVideoIndex];
    player.loadVideoById(currentVideo);
  } else {
    console.log("End of this playlist");
  }
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


// 2. This code loads the IFrame Player API code asynchronously.
function prepareYouTubePlayer() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  $(".nextVideoBtn").show().removeClass("disabled");
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: currentVideo,
    playerVars: {
      'enablejsapi': 1, // enables control via the YT embed API
      'controls': 2, // 0 disables player controls, 2, enables
      'iv_load_policy': 3,
      'rel': 0 // disable recommended videos afterplayback
      //  'origin': // My domain should be specified here
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {  // video ended
    console.log("video is over!");
    queNextVideo();
  }
}

function onPlayerError(errorEvent) {
  var errorMsg;
  switch (errorEvent) {
    case 2:
      errorMsg = "The request contains an invalid parameter value";
      break;
    case 5:
      errorMsg = "The requested content cannot be played in an HTML5 player...";
      break;
    case 100:
      errorMsg = "The video requested was not found.";
      break;
    case 101:
    case 150:
      errorMsg = "The owner of the requested video does not allow it to be played in embedded players.";
      break;
  }
  console.log(errorMsg);
}


// function promptUserToCreateYouTubePlaylist(makePlaylistFrom) {
//   $(".allSearchResults").append("<br><button class='createPlaylist btn btn-info'>Create this playlist</button>");
//   $(".createPlaylist").click(function () {
//     $(this).addClass("disabled");
//     $(this).html("Now creating your playlist...");
//     searchArrayOfArtists(makePlaylistFrom);
//   });
// }


// BUG: clicking search after results are already displayed, will duplicate displayed results.
// BUG: Shouldn't be able to search a blank initialSearchKeyord
