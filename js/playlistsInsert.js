"use strict";

window.onload = function () {
  (function checkAuth() {
    gapi.auth.authorize({
      client_id: '847638938655-sh07q333hjtsbqt3b6t2r264fpepj873.apps.googleusercontent.com',
      scope: ['https://www.googleapis.com/auth/youtube'],
      immediate: true,
    }, handleAuthResult);
  })();
};

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    currentPlayerInfo.userLoggedIn = true;
    loadAPIClientInterfaces();
    $(".pre-auth").hide();
  } else {
    currentPlayerInfo.userLoggedIn = false;
    $(".createMixtapeBtn").addClass("disabled");
  }
}

function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function () {
    console.log("YouTube create playlist API is loaded");
  });
}

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('Name: ' + profile.getName());
  // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  // console.log('Image URL: ' + profile.getImageUrl());
  // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  $(".pre-auth").slideUp("slow", function () {
    $(".createMixtapeBtn").removeClass("disabled");
  });
}

// Create YouTube Playlist
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
