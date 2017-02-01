// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  //$('#search-button').attr('disabled', false);
  console.log("YouTube API... is loaded");
}

var currentVideo;
var currentVideoTitle;
var nextPageToken;
var currentArtist;

// 2. This code loads the IFrame Player API code asynchronously.
(function prepareYouTubePlayer() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: currentVideo,
    playerVars: {
      'enablejsapi': 1,
      'controls': 2, // 0 disables player controls, 2 enables
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
var onPlayerReady = function (event) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
}

// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.BUFFERING:
      if (playbackTimer !== "Initial playback not started") {
        var playbackbackTimeElapsed = formatMinutesAndSeconds(Math.round(player.getCurrentTime()));
        $(".currentTime").html(playbackbackTimeElapsed);
      }
      break;
    case YT.PlayerState.PLAYING:
      getDurationOfPlayingVideo();
      $(".pausePlayer").removeClass("btn-warning").addClass("btn-default");
      break;
    case YT.PlayerState.PAUSED:
      console.log("Paused");
      clearInterval(playbackTimer);
      $(".pausePlayer").removeClass("btn-default").addClass("btn-warning");
      break;
    case YT.PlayerState.ENDED:
      console.log("video is over");
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
      maxResults: 10,
      type: "video",
      videoCategoryId: 10, // 10 = music, 22 = People & Blogs
      videoEmbeddable: "true"
    });
    if (artist !== currentArtist) {
      currentArtist = artist;
    } else {
      request.Zq.k5.params.pageToken = nextPageToken;
      request.Zq.k5.params.maxResults = 2;
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
    var index = getRandomInt(0, response.result.items.length);
    var selectedResult = response.result.items[index].snippet;
    if (selectedResult.title.toLowerCase() === currentVideoTitle) { // Would be easy to compare to array of videoID's to completely avoid any repeats in a session.
      assignCurrentVideoFromSearchResults(response);
    } else {
      nextPageToken = response.nextPageToken;
      currentVideoTitle = selectedResult.title.toLowerCase();
      var description = selectedResult.description;
      var thumbnailURL = selectedResult.thumbnails.default.url;
      var videoID = thumbnailURL.slice(-23, -12);
      currentVideo = videoID;
    }

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

var playCurrentVideo = function (videoID) {
  return new Promise(function (resolve, reject) {
    var nowPlaying = false;
    player.loadVideoById(videoID);
    $(".nowPlaying").fadeOut("slow", function () {
      $(this).css("visibility", "visible");
      $(this).html("Playing <span>" + currentVideoTitle + "</span>").fadeIn("slow");
    });
    nowPlaying = true;
    if (nowPlaying) {
      resolve("Now playing your video!");
    } else {
      reject("Problem with playVideo()");
    }
  });
}

var playbackTimer = "Initial playback not started";
function getDurationOfPlayingVideo() {
  var totalDuration = Math.round(player.getDuration());
  if (!totalDuration > 0) {
    console.log("Waiting to receive totalDuration");
    setTimeout(getDurationOfPlayingVideo, 0);
  } else {
    var trackLength = formatMinutesAndSeconds(totalDuration);
    $(".trackLength").html(" / " + trackLength);
    $(".trackCounter").show();

    var currentTime = Math.round(player.getCurrentTime());
    clearInterval(playbackTimer);

    playbackTimer = setInterval(function () {
      currentTime++;
      playbackbackTimeElapsed = formatMinutesAndSeconds(currentTime);
      $(".currentTime").html(playbackbackTimeElapsed);
    }, 1000);
  }
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
// Define some variables used to remember state.
// var playlistId;
// var channelId;

// // Create a private playlist.
// function createPlaylist(playlistTitle) {
//   var request = gapi.client.youtube.playlists.insert({
//     part: 'snippet,status',
//     resource: {
//       snippet: {
//         title: playlistTitle,
//         description: 'A programmatically generated playlist'
//       },
//       status: {
//         privacyStatus: 'private'
//       }
//     }
//   });
//   displayStatusOfPlaylistToUser(request);
// }

// function displayStatusOfPlaylistToUser(request) {
//   request.execute(function (response) {
//     var result = response.result;
//     if (result) {
//       playlistId = result.id;
//       console.log("https://www.youtube.com/playlist?list=" + playlistId);

//       // $('#playlist-id').val(playlistId);
//       // $('#playlist-title').html(result.snippet.title);
//       // $('#playlist-description').html(result.snippet.description);
//     } else {
//       // $('#status').html('Could not create playlist');
//     }
//   });
// }

// // Add a video to a playlist. The "startPos" and "endPos" values let you
// // start and stop the video at specific times when the video is played as
// // part of the playlist. However, these values are not set in this example.
// function addToPlaylist(id, startPos, endPos) {
//   var details = {
//     videoId: id,
//     kind: 'youtube#video'
//   }
//   if (startPos != undefined) {
//     details['startAt'] = startPos;
//   }
//   if (endPos != undefined) {
//     details['endAt'] = endPos;
//   }
//   var request = gapi.client.youtube.playlistItems.insert({
//     part: 'snippet',
//     resource: {
//       snippet: {
//         playlistId: playlistId,
//         resourceId: details
//       }
//     }
//   });
//   request.execute(function (response) {
//     // $('#status').html('<pre>' + JSON.stringify(response.result) + '</pre>');
//   });
// }

// function autoCreatePlaylist(playlistTitle) {
//   createPlaylist(playlistTitle);
//   var addSlowly;
//   setTimeout(function () {
//     addSlowly = setInterval(iterateThroughSampleVideoArraySlowly, 200);
//   }, 500); // Would be better to base all this on callbacks--using timed events for now

//   var j = 0;
//   function iterateThroughSampleVideoArraySlowly() {
//     addToPlaylist(videosForPlaylist[j]);
//     //console.log(videosForPlaylist[j] + " added");
//     if (j < videosForPlaylist.length) {
//       j++;
//     } else {
//       clearInterval(addSlowly);
//       $(".createPlaylist").hide();
//       $(".allSearchResults").append("<button class='viewPlaylist btn btn-info'>View playlist</button>");
//       $(".viewPlaylist").click(function () {
//         window.open("https://www.youtube.com/playlist?list=" + playlistId);
//       });
//     }
//   }
// }

