"use strict";

(function prepareYouTubePlayer() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

function onYouTubeIframeAPIReady() {
  currentPlayerInfo.player = new YT.Player('player', {
    height: '390',
    width: '640',
    playerVars: {
      'enablejsapi': 1,
      'controls': 2, // 0 disables player controls, 2 enables
      'showinfo': 0,
      'iv_load_policy': 3,
      'rel': 0
    },
    events: {
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}

function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.BUFFERING:
      if (currentPlayerInfo.playbackTimer) {
        var currentTime = formatMinutesAndSeconds(Math.round(currentPlayerInfo.player.getCurrentTime()));
        $(".currentTime").html(currentTime);
      }
      break;
    case YT.PlayerState.PLAYING:
      getDurationOfPlayingVideo().then(function (result) {
        return assignTimer(result);
      });
      $(".pausePlayerBtn").removeClass("btn-warning").addClass("btn-default");
      break;
    case YT.PlayerState.PAUSED:
      clearInterval(currentPlayerInfo.playbackTimer);
      $(".pausePlayerBtn").removeClass("btn-default").addClass("btn-warning");
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

function getDurationOfPlayingVideo() {
  return new Promise(function (resolve, reject) {
    var totalDuration = Math.round(currentPlayerInfo.player.getDuration());
    if (totalDuration > 0) {
      resolve(totalDuration);
    }
  });
}

function assignTimer(totalDuration) {
  return new Promise(function (resolve, reject) {
    var trackLength = formatMinutesAndSeconds(totalDuration);
    $(".trackLength").html(" / " + trackLength);
    $(".trackCounter").show(); // Includes both ".currentTime" and ".trackLength"
    var currentTime = Math.round(currentPlayerInfo.player.getCurrentTime());
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