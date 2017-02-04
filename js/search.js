
var player;
var currentVideo;
var nextPageToken;
var currentArtist;

// After auth.js completes successfully...
function handleAPILoaded() {
  console.log("YouTube search/create playlist API loaded");
}

$(document).ready(prepareYouTubePlayer());

// Loads the IFrame Player API code asynchronously.
function prepareYouTubePlayer() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Creates an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    playerVars: {
      'enablejsapi': 1,
      'controls': 2, // 0 disables player controls, 2 enables
      'showinfo': 0,
      'iv_load_policy': 3,
      'rel': 0 // disable recommended videos afterplayback
      //  'origin': // My domain should be specified here
    },
    events: {
      // 'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}

// YouTube iframe API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.BUFFERING:
      if (playbackTimer !== "Initial playback not started") {
        var currentTime = formatMinutesAndSeconds(Math.round(player.getCurrentTime()));
        $(".currentTime").html(currentTime);
      }
      break;
    case YT.PlayerState.PLAYING:
      Promise.resolve(getDurationOfPlayingVideo());
      $(".pausePlayer").removeClass("btn-warning").addClass("btn-default");
      break;
    case YT.PlayerState.PAUSED:
      clearInterval(playbackTimer);
      $(".pausePlayer").removeClass("btn-default").addClass("btn-warning");
      break;
    case YT.PlayerState.ENDED:
      queNextVideo(allResults);
      break;
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

var createAndRunVideoSearch = function (artist) {
  return new Promise(function (resolve, reject) {
    var request = gapi.client.youtube.search.list({
      q: artist,
      part: 'snippet',
      maxResults: 15,
      type: "video",
      videoCategoryId: 10, // 10 = music, 22 = People & Blogs
      videoEmbeddable: "true"
    });
    if (artist !== currentArtist) {
      currentArtist = artist;
    } else {
      request.Zq.k5.params.pageToken = nextPageToken;
    }

    if (request) {
      resolve(request);
    } else {
      reject("createVideoSearch reject error");
    }
  });
}

var assignCurrentVideoFromSearchResults = function (response) {
  return new Promise(function (resolve, reject) {
    var selectedResult;
    var pickVideoCount = 0;
    (function pickVideoRandomly() {
      var index = getRandomInt(0, response.result.items.length);
      selectedResult = response.result.items[index].snippet;
      for (var i = 0; i < listenHistory.length; i++) {
        if (listenHistory[i].title === selectedResult.title.toLowerCase()) {
          break;
          if (pickVideoCount < 50) { // Avoid infinite loop
            pickVideoCount++;
            pickVideoRandomly();
          }
        }
      }
    })();
    nextPageToken = response.nextPageToken;
    var description = selectedResult.description;
    var thumbnailURL = selectedResult.thumbnails.default.url;
    var videoID = thumbnailURL.slice(-23, -12);
    currentVideo = {
      "artist": currentArtist,
      "title": selectedResult.title.toLowerCase(),
      "videoID": videoID
    };
    listenHistory.push(currentVideo);

    if (currentVideo) {
      resolve(currentVideo);
    } else {
      reject("runVideoSearchAndAssignCurrentVideo reject error");
    }
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var playCurrentVideo = function (currentVideo) {
  return new Promise(function (resolve, reject) {
    var nowPlaying = false;
    player.loadVideoById(currentVideo.videoID);
    $(".nowPlaying").fadeOut("slow", function () {
      $(this).css("visibility", "visible");
      $(this).html("Playing <span>" + currentVideo.title + "</span>").fadeIn("slow");
    });
    nowPlaying = true;
    if (nowPlaying) {
      resolve(currentVideo.videoID);
    } else {
      reject("Problem with playVideo()");
    }
  });
}

var playbackTimer = "Initial playback not started";

function getDurationOfPlayingVideo() {
  return new Promise(function (resolve, reject) {
    var totalDuration = Math.round(player.getDuration());
    var trackLength = formatMinutesAndSeconds(totalDuration);
    $(".trackLength").html(" / " + trackLength);
    $(".trackCounter").show(); // Includes both ".currentTime" and ".trackLength"
    var currentTime = Math.round(player.getCurrentTime());
    clearInterval(playbackTimer);
    playbackTimer = setInterval(function () {
      currentTime++;
      $(".currentTime").html(formatMinutesAndSeconds(currentTime));
    }, 1000);

    if (totalDuration > 0 && currentTime >= 0) {
      resolve("getDurationOfPlayingVideo resolved");
    } else {
      reject("getDurationOfPlayingVideo() rejected");
    }
  });
}

function formatMinutesAndSeconds(time) {
  var minutes = parseInt(time / 60);
  var seconds = time - (minutes * 60);
  if (time < 59) {
    minutes = 0;
    seconds = time;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}


// ADD TO PLAYLIST SECTION:
var playlistId;
var channelId;


function autoCreatePlaylist() {
  var playlistTitle = "From " + listenHistory[0].artist + " to " + listenHistory[listenHistory.length - 1].artist;
  var addVideosSlowly;
  createPlaylist(playlistTitle);
  setTimeout(function () {   // Todo: Find better async method
    addVideosSlowly = setInterval(iterateThroughSampleVideoArraySlowly, 250);
  }, 500);
  var addVideosToPlaylistCount = 0;
  function iterateThroughSampleVideoArraySlowly() {
    addToPlaylist(listenHistory[addVideosToPlaylistCount].videoID);
    console.log("Now adding: " + listenHistory[addVideosToPlaylistCount].videoID);
    addVideosToPlaylistCount++;
    if (addVideosToPlaylistCount === listenHistory.length) {
      clearInterval(addVideosSlowly);
      $(".createPlaylist").hide();
      $(".viewPlaylist").show();
      $(".viewPlaylist").click(function () {
        window.open("https://www.youtube.com/playlist?list=" + playlistId);
      });
    }
  }
}

function createPlaylist(playlistTitle) {
  var request = gapi.client.youtube.playlists.insert({
    part: 'snippet,status',
    resource: {
      snippet: {
        title: playlistTitle,
        description: 'A programmatically generated playlist from YouTube MixTape'
      },
      status: {
        privacyStatus: 'private'
      }
    }
  });
  request.execute(function(response) {
    var result = response.result;
    if (result) {
      playlistId = result.id;
      // $('#playlist-id').val(playlistId);
      // $('#playlist-title').html(result.snippet.title);
      // $('#playlist-description').html(result.snippet.description);
    } else {
      // $('#status').html('Could not create playlist');
    }
  });
}

function addToPlaylist(id, startPos, endPos) {
  var details = {
    videoId: id,
    kind: 'youtube#video'
  }
  if (startPos != undefined) {
    details['startAt'] = startPos;
  }
  if (endPos != undefined) {
    details['endAt'] = endPos;
  }
  var request = gapi.client.youtube.playlistItems.insert({
    part: 'snippet',
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: details
      }
    }
  });
  request.execute(function (response) {
    // $('#status').html('<pre>' + JSON.stringify(response.result) + '</pre>');
  });
}
