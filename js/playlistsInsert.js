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
    $(".createEditMixtapeBtn").addClass("disabled");
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
    $(".createEditMixtapeBtn").removeClass("disabled");
  });
}

// Create YouTube Playlist
var playlistId;

function autoCreatePlaylist() {
  var playlistTitle = "From " + listenHistory.mixtape[0].artist + " to " +
    listenHistory.mixtape[listenHistory.mixtape.length - 1].artist;
  createPlaylist(playlistTitle).then(function () {
    addVideoToPlaylistWhenPromiseResolves();
  });
}

function createPlaylist(playlistTitle) {
  return new Promise(function (resolve, reject) {
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
        resolve(response);
      } else {
        reject("Could not create playlist");
      }
    });
  });
}

var addVideosToPlaylistCount = 0;
function addVideoToPlaylistWhenPromiseResolves() {
  var videoToAdd = listenHistory.mixtape[addVideosToPlaylistCount].videoID;
  addToPlaylist(videoToAdd).then(function () {
    if (addVideosToPlaylistCount < listenHistory.mixtape.length - 1) {
      addVideosToPlaylistCount++;
      addVideoToPlaylistWhenPromiseResolves()
    } else {
      addVideosToPlaylistCount = 0;
      $(".mixtapeStatusMessage").slideUp("slow", function () {
        $(".editMixtapeBtn").fadeIn("slow");
        $(".viewMixtapeBtn").fadeIn("slow").removeClass("disabled");
      });
    }
  });
}

function addToPlaylist(id) {
  return new Promise(function (resolve, reject) {
    var details = {
      videoId: id,
      kind: 'youtube#video'
    };
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
      if (response) {
        resolve(response);
      } else {
        reject("Did not receive response from addToPlaylist()");
      }
    });
  });
}

function deletePlaylist() {
  return new Promise(function (resolve, reject) {
    if (playlistId) {
      var request = gapi.client.youtube.playlists.delete({
        id: playlistId
      });
      request.execute(function (response) {
        if (response) {
          resolve(response);
        } else {
          reject("Did not receive response from deletePlaylist()");
        }
      });
    }
  });
}
