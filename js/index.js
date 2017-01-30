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
  if (resultsArray.length > limit) {
    resultsArray = resultsArray.slice(0, limit);
  }
  $(".allSearchResults").append('<br><span style="color:#7ca9be;">' + methodUsed + '</span><br>');

  resultsArray.forEach(function (result) {
    $(".allSearchResults").append('<button class="btn-link"><li class="individualResult">' + result + '</li></button>');
  });

  $(".individualResult").click(function () {
    // Skips ahead to this artist in the currently displayed playlist
    addThisVideoToListenHistory(videoTitle);
    arrayCount = resultsArray.indexOf($(this).html());
    createSearch(resultsArray[arrayCount]);
    setTimeout(function () { // Figure out a better asynch technique (this is a bandaid to fix a race condition)
      player.loadVideoById(videoToPlay);
    }, 300);
  });

  createSearch(resultsArray[0]);
  beginPlayingFromResults();
}

function beginPlayingFromResults() {
  if (!videoToPlay) {
    console.log("waiting for video results...");
    setTimeout(beginPlayingFromResults, 0);
  } else {
    if (!player) {
      prepareYouTubePlayer();
    } else {
      player.loadVideoById(videoToPlay);
    }
  }
}

$(".nextVideoBtn").click(function () {
  if ($(".lockArtist").hasClass("btn-default")) {
    queNextVideo(similarArtistsSpotify);
  } else {
    addThisVideoToListenHistory(videoTitle);
    createSearch(similarArtistsSpotify[arrayCount]);
    setTimeout(function () { // Figure out a better asynch technique (this is a bandaid to fix a race condition)
      player.loadVideoById(videoToPlay);
    }, 300);
  }
});

$(".lockArtist").click(function () {
  if ($(this).hasClass("btn-default")) {
    $(this).removeClass("btn-default").addClass("btn-warning"); // Enable
  } else {
    $(this).removeClass("btn-warning").addClass("btn-default"); // Disable
  }
});

$(".showHidePlayer").click(function () {
  if ($(this).html() === "Show player") {
    $(".videoWrapper").slideDown("slow", function () {
      $(".showHidePlayer").html("Hide player");
    });
  } else {
    $(".videoWrapper").slideUp("slow", function () {
      $(".showHidePlayer").html("Show player");
    });
  }
  $(this).blur();
});

var arrayCount = 0;
function queNextVideo(arrayToQueueFrom) {
  addThisVideoToListenHistory(videoTitle);
  arrayCount++;
  createSearch(arrayToQueueFrom[arrayCount]);
  setTimeout(function () {
    player.loadVideoById(videoToPlay);
  }, 500);
}

function addThisVideoToListenHistory(currentVideoTitle) {
  $(".listenHistory").append("<li>" + currentVideoTitle + "</li>");
  $(".clearListenHistoryBtn").show();
}

function clearDisplayedResults() {
  $(".searchedFor").html("");
  $(".allSearchResults").html("");
  $(".numberOfResultsFound").html("");
  $(".clearListenHistoryBtn").hide();
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

$(".clearListenHistoryBtn").click(function () {
  $(".listenHistory").slideUp("slow", function () {
    $(".clearListenHistoryBtn").fadeOut("slow", function () {
      $(".listenHistory").html("").show();
    });
  });
});


// 2. This code loads the IFrame Player API code asynchronously.
function prepareYouTubePlayer() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  $(".btn-group").fadeIn("slow");
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: videoToPlay,
    playerVars: {
      'enablejsapi': 1, // enables control via the YT embed API
      'controls': 2, // 0 disables player controls, 2, enables
      'showinfo': 0,
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

    if ($(".lockArtist").hasClass("btn-default")) {
      queNextVideo(similarArtistsSpotify);
    } else {
      addThisVideoToListenHistory(videoTitle);
      createSearch(similarArtistsSpotify[arrayCount]);
      setTimeout(function () { // Figure out a better asynch technique (this is a bandaid to fix a race condition)
        player.loadVideoById(videoToPlay);
      }, 300);
    }

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


// Roughing in an idea for a bootstrap progress bar, which will monitor video playback
// Plan to use player.getDuration()
// var time = 0;
// setInterval(function () {
//   time++;
//   $(".progress-bar").css("width", time + "%");
// }, 1000);




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
