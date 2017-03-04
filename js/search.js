"use strict";

function findAndPlayVideo() {
  createVideoSearch().then(function (result) {
    return assignCurrentVideoFromSearchResults(result);
  }).then(function (result) {
    return playCurrentVideo(result);
  }).then(function () {
    displayResults();
  });
}

var createVideoSearch = function () {
  return new Promise(function (resolve, reject) {
    if (currentPlayerInfo.artist() !== currentPlayerInfo.artistLastSearched) {
      currentPlayerInfo.artistLastSearched = currentPlayerInfo.artist();
      var query = currentPlayerInfo.artistLastSearched;
      $.getJSON("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=" +
        query + "&regionCode=US&type=video&videoCategoryId=10&videoDuration=short&videoEmbeddable=true&key=AIzaSyAxXnGEhkkZmEh7zfugJpAsJ7kpSU4GbDc")
        .fail(function () {
          reject("createVideoSearch reject error");
        })
        .done(function (data) {
          currentPlayerInfo.tempYouTubeVideoResults = data;
          resolve(data);
        });
    } else {
      resolve(currentPlayerInfo.tempYouTubeVideoResults);
    }
  });
};

var assignCurrentVideoFromSearchResults = function (response) {
  return new Promise(function (resolve, reject) {
    var selectedResult;
    var videosNotYetListenedTo = [];
    var regex = new RegExp("[^0-9a-z]|" + currentPlayerInfo.artist(), "gi");
    for (var i = 0; i < response.items.length; i++) {
      var resultTitle = response.items[i].snippet.title.toLowerCase().replace(regex, '');
      if (listenHistory.titlesOnly.indexOf(resultTitle) === -1) {
        videosNotYetListenedTo.push(response.items[i].snippet);
      }
    }
    selectedResult = videosNotYetListenedTo[Math.floor(Math.random() * videosNotYetListenedTo.length)];
    if (!selectedResult) {
      selectedResult = response.items[Math.floor(Math.random() * response.items.length)].snippet;
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
    currentPlayerInfo.player.loadVideoById(currentVideo.videoID);
    $(".nowPlaying").fadeOut("slow", function () {
      $(this).css("visibility", "visible");
      $(this).html("Playing <span>" + currentVideo.videoTitle + "</span>").fadeIn("slow");
    });
    if (currentVideo.videoID) {
      resolve(currentVideo.videoID);
    } else {
      reject("Problem with playVideo()");
    }
  });
};


// Create YouTube Playlist Functionality
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
      $(".createMixtapeBtn").fadeOut("slow", function () {
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
