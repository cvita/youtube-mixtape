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
      $(this).html("Playing <span>" + currentVideo.videoTitle + "</span>").fadeIn("slow");
    });
    if (currentVideo.videoID) {
      resolve(currentVideo.videoID);
    } else {
      reject("Problem with playVideo()");
    }
  });
};
