
var player;

$(document).ready(prepareYouTubePlayer());

// Loads the IFrame Player API code asynchronously.
function prepareYouTubePlayer() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Creates an <iframe> and YouTube player after the API code downloads.
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    playerVars: {
      'enablejsapi': 1,
      'controls': 2, // 0 disables player controls, 2 enables
      'showinfo': 0,
      'iv_load_policy': 3,
      'rel': 0
      //  'origin': // My domain should be specified here
    },
    events: {
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}

// YouTube iframe API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.BUFFERING:
      if (currentPlayerInfo.playbackTimer) {
        var currentTime = formatMinutesAndSeconds(Math.round(player.getCurrentTime()));
        $(".currentTime").html(currentTime);
      }
      break;
    case YT.PlayerState.PLAYING:
      Promise.resolve(getDurationOfPlayingVideo());
      $(".pausePlayer").removeClass("btn-warning").addClass("btn-default");
      break;
    case YT.PlayerState.PAUSED:
      clearInterval(currentPlayerInfo.playbackTimer);
      $(".pausePlayer").removeClass("btn-default").addClass("btn-warning");
      break;
    case YT.PlayerState.ENDED:
      queNextVideo();
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

var currentPlayerInfo = {
  artist: function () {
    if (similarArtists.results.length > 0) {
      return similarArtists.results[similarArtists.artistPosition].name;
    }
  },
  // QUESTION: Should I declare these keys here? Their values are assined in assignCurrentVideoFromSearchResults()
  playbackTimer: undefined,
  artistLastSearched: undefined,
  tempYouTubeVideoResults: undefined,
  videoTitle: undefined,
  videoID: undefined,
  videoDescription: undefined
};

var listenHistory = {
  getCurrentPlayerInfo: function () {
    this.previousVideos.push({
      artist: currentPlayerInfo.artist(),
      videoTitle: currentPlayerInfo.videoTitle,
      videoID: currentPlayerInfo.videoID,
      videoDescription: currentPlayerInfo.videoDescription
    });
    var regex = new RegExp("[^0-9a-z]|" + currentPlayerInfo.artist(), "gi");
    this.titlesOnly.push(currentPlayerInfo.videoTitle.replace(regex, ''));
  },
  previousVideos: [],
  titlesOnly: []
};

function findAndPlayVideo() {
  createVideoSearch().then(function (result) {
    return confirmVideoSearchResults(result);
  }).then(function (result) {
    return assignCurrentVideoFromSearchResults(result);
  }).then(function (result) {
    return playCurrentVideo(result);
  });
}

var createVideoSearch = function () {
  return new Promise(function (resolve, reject) {
    var request;
    if (currentPlayerInfo.artist() !== currentPlayerInfo.artistLastSearched) {
      currentPlayerInfo.artistLastSearched = currentPlayerInfo.artist();
      request = gapi.client.youtube.search.list({
        q: currentPlayerInfo.artistLastSearched,
        part: 'snippet',
        maxResults: 15,
        type: "video",
        videoDuration: "short", // "medium" would also be useful. Consider removing this. (Issue is "long" would be valid)
        videoCategoryId: 10, // 10 = music, 22 = People & Blogs
        regionCode: "US",
        videoEmbeddable: "true"
      });
      currentPlayerInfo.tempYouTubeVideoResults = request;
    } else {
      request = currentPlayerInfo.tempYouTubeVideoResults;
    }
    if (request) {
      resolve(request);
    } else {
      reject("createVideoSearch reject error");
    }
  });
};

var confirmVideoSearchResults = function (response) {
  return new Promise(function (resolve, reject) {
    if (response.result) {
      resolve(response);
    } else {
      reject("Unable to obtain value from request");
    }
  });
};

var assignCurrentVideoFromSearchResults = function (response) {
  return new Promise(function (resolve, reject) {
    var selectedResult;
    var videosNotYetListenedTo = [];
    var regex = new RegExp("[^0-9a-z]|" + currentPlayerInfo.artist(), "gi");
    for (var i = 0; i < response.result.items.length; i++) {
      var resultTitle = response.result.items[i].snippet.title.toLowerCase().replace(regex, '');
      if (listenHistory.titlesOnly.indexOf(resultTitle) === -1) {
        videosNotYetListenedTo.push(response.result.items[i].snippet);
      }
    }
    selectedResult = videosNotYetListenedTo[Math.floor(Math.random() * videosNotYetListenedTo.length)];
    console.log("Selected from videosNotYetListenedTo", selectedResult);
    if (!selectedResult) {
      selectedResult = response.result.items[Math.floor(Math.random() * response.result.items.length)].snippet;
      console.log("Selected from general YouTube results", selectedResult);
    }
    currentPlayerInfo.videoTitle = selectedResult.title.toLowerCase();
    currentPlayerInfo.videoID = selectedResult.thumbnails.default.url.slice(-23, -12);
    currentPlayerInfo.videoDescription = selectedResult.description;
    listenHistory.getCurrentPlayerInfo();
    resolve(currentPlayerInfo);
  });
};

var playCurrentVideo = function (currentVideo) {
  return new Promise(function (resolve, reject) {
    var nowPlaying = false;
    player.loadVideoById(currentVideo.videoID);
    $(".nowPlaying").fadeOut("slow", function () {
      $(this).css("visibility", "visible");
      $(this).html("Playing <span>" + currentVideo.videoTitle + "</span>").fadeIn("slow", function () {
        displayListenHistory(currentVideo.videoTitle);
      });
    });
    nowPlaying = true;
    if (nowPlaying) {
      resolve(currentVideo.videoID);
    } else {
      reject("Problem with playVideo()");
    }
  });
};


$(".listenHistory").sortable();
$(".listenHistory").disableSelection();

function displayListenHistory(title) {
  if (title !== undefined) {
    $(".listenHistory").append("<li><span>" + title + "</span><button class='deleteVideoFromHistoryBtn btn btn-sm btn-danger'>x</button></li>");
    assignSortableListenHistoryFunctionality();
    $(".createMixtape").show();
    $(".clearListenHistoryBtn").show();
    assignDeleteVideoFromHistoryBtnFunctionality();
  }
}

function assignSortableListenHistoryFunctionality() {
  $(".listenHistory li").mouseup(function () {
    setTimeout(function () {
      var tempArray = [];
      $(".listenHistory li").each(function (li) {
        var videoTitleFromDOM = $(this).text().slice(0, -1);
        for (var i = 0; i < listenHistory.previousVideos.length; i++) {
          if (videoTitleFromDOM.indexOf(listenHistory.previousVideos[i].videoTitle) !== -1) {
            tempArray.push(listenHistory.previousVideos[i]);
          }
        }
      });
      listenHistory.previousVideos = tempArray;
    }, 10);
  });
}


function assignDeleteVideoFromHistoryBtnFunctionality() {
  $(".deleteVideoFromHistoryBtn").click(function () {
    var videoTitle = $(this).parent(".listenHistory li")[0].innerHTML;
    $(".listenHistory li").each(function (li) {
      if ($(this).html() === videoTitle) {
        $(this).fadeOut("slow");
        for (var i = 0; i < listenHistory.previousVideos.length; i++) {
          if ($(this).html().indexOf(listenHistory.previousVideos[i].videoTitle) !== -1) {
            listenHistory.previousVideos.splice(i, 1);
            break;
          }
        }
      }
    });
  });
}

function getDurationOfPlayingVideo() {
  return new Promise(function (resolve, reject) {
    var totalDuration = Math.round(player.getDuration());
    var trackLength = formatMinutesAndSeconds(totalDuration);
    $(".trackLength").html(" / " + trackLength);
    $(".trackCounter").show(); // Includes both ".currentTime" and ".trackLength"
    var currentTime = Math.round(player.getCurrentTime());
    clearInterval(currentPlayerInfo.playbackTimer);
    currentPlayerInfo.playbackTimer = setInterval(function () {
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


// Create YouTube Playlist Section:
var playlistId;
var channelId;

function autoCreatePlaylist() {
  var playlistTitle = "From " + listenHistory.previousVideos[0].artist + " to " + listenHistory.previousVideos[listenHistory.previousVideos.length - 1].artist;
  var addVideosSlowly;
  createPlaylist(playlistTitle);
  setTimeout(function () {   // Todo: Find better async method
    addVideosSlowly = setInterval(iterateThroughSampleVideoArraySlowly, 250);
  }, 500);
  var addVideosToPlaylistCount = 0;
  function iterateThroughSampleVideoArraySlowly() {
    addToPlaylist(listenHistory.previousVideos[addVideosToPlaylistCount].videoID);
    console.log("Now adding: " + listenHistory.previousVideos[addVideosToPlaylistCount].videoID);
    addVideosToPlaylistCount++;
    if (addVideosToPlaylistCount === listenHistory.previousVideos.length) {
      clearInterval(addVideosSlowly);
      $(".createMixtape").fadeOut("slow", function () {
        $(".viewMixtape").fadeIn("slow");
      });

      $(".viewMixtape").click(function () {
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
  request.execute(function (response) {
    var result = response.result;
    if (result) {
      playlistId = result.id;
      console.log("Playlist ID: " + playlistId);
    } else {
      console.log("Could not create playlist");
    }
  });
}

function addToPlaylist(id, startPos, endPos) {
  var details = {
    videoId: id,
    kind: 'youtube#video'
  };
  if (startPos !== undefined) {
    details['startAt'] = startPos;
  }
  if (endPos !== undefined) {
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
