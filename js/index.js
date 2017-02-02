"use strict";

$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    runSearch();
    this.blur();
  }
});

$(".searchBtn").click(function () {
  runSearch();
});

var allResults;
var fullGenreList;
var initialArtist;
var artistPosition = 0;

function runSearch() {
  allResults = [];
  fullGenreList = [];
  initialArtist = document.getElementById("initialSearchInput").value.toLowerCase();
  getInitialArtistFullGenreListViaSpotify(initialArtist);
  $(".subheading").slideUp("fast");
}

// var combineSearchMethodsCount = 0;
// function combineSpotifyAndAutoSuggestionResults(resultsArray) {
//   combineSearchMethodsCount++;
//   if (combineSearchMethodsCount === 1) {
//     allResults = resultsArray;
//   }
//   if (combineSearchMethodsCount === 2) {
//     combineSearchMethodsCount = 0;
//     allResults = allResults.concat(resultsArray);
//     if (allResults.length === 0) {
//       allResults.push(initialArtist);
//       $(".allSearchResults").append("We were weren't able to find similar artists, but here's a result from your search");
//       $(".lockArtist").removeClass("btn-default").addClass("btn-warning"); // Enables "Lock artist"
//     }
//     beginPlayingFirstVideo(allResults);
//   }
// }

function beginPlayingFirstVideo(allResults) {
  Promise.all([
    createAndRunVideoSearch(allResults[0]).then(function (result) {
      return assignCurrentVideoFromSearchResults(result);
    }),
    onPlayerReady()
  ]).then(function (values) {
    playCurrentVideo(values[0]);
    displayResults(allResults);
    highLightCurrentArtistButton();
  });
}

function displayResults(allResults) {
  $(".btn-group").show(); // Custom UI for video
  $(".relevanceColorScale").show();
  $(".allSearchResults").html("");

  var forEachCount = 0;
  similarArtistsSpotify.forEach(function (result) { // Roughed in
    forEachCount++;
    var relevance;
    if (result.frequency > 7) {
      relevance = "relevance5of5";
    } else if (result.frequency < 3) {
      relevance = "relevance1of5";
    }

    switch (result.frequency) {
      case 7:
        relevance = "relevance5of5";
        break;
      case 6:
        relevance = "relevance4of5";
        break;
      case 5:
        relevance = "relevance3of5";
        break;
      case 4:
        relevance = "relevance2of5";
        break;
      case 3:
        relevance = "relevance1of5";
        break;
    }


    if (forEachCount <= 15) {
      $(".allSearchResults").append(
        '<button class="btn-link"><li class="individualResult ' + relevance + '">' + result.name + '</li></button>'
      );
    } else {
      $(".additionalResults").append(
        '<button class="btn-link "><li class="individualResult ' + relevance + '">' + result.name + '</li></button>'
      );
    }
    if (forEachCount === 15) {
      $(".allSearchResults").append('<br><button class="moreResultsBtn btn btn-default btn-sm">More results</button>');
      $(".allSearchResults").append('<div class="additionalResults"></div>');
    }
  });



  $(".individualResult").click(function () {
    addThisVideoToListenHistory(currentVideoTitle);
    artistPosition = allResults.indexOf($(this).html());
    findAndPlayVideo(allResults[artistPosition]);
    highLightCurrentArtistButton();
  });

  $(".moreResultsBtn").click(function () {
    if ($(this).html() === "More results") {
      $(".additionalResults").slideDown("slow");
      $(".moreResultsBtn").html("Less results");
    } else {
      $(".additionalResults").slideUp("slow");
      $(".moreResultsBtn").html("More results");
    }
  });
}

// JS Promises!
var findAndPlayVideo = function (artist) {
  createAndRunVideoSearch(artist).then(function (result) {
    return assignCurrentVideoFromSearchResults(result);
  }).then(function (result) {
    return playCurrentVideo(result);
  }).then(function (result) {
    console.log(result);
  });
}


$(".nextVideoBtn").click(function () {
  queNextVideo(allResults);
});

function queNextVideo(allResults) {
  if ($(".lockArtist").hasClass("btn-default")) { // If "Lock artist" is disabled
    artistPosition++;
  }
  addThisVideoToListenHistory(currentVideoTitle);
  findAndPlayVideo(allResults[artistPosition]);
  highLightCurrentArtistButton();
  clearInterval(playbackTimer);
  playbackTimer = "Initial playback not started";
  $(".currentTime").html("0:00");
  $(".trackLength").html(" / 0:00");
}

function highLightCurrentArtistButton() {
  var listItems = $(".allSearchResults li");
  listItems.each(function (li) {
    if ($(this).html() === allResults[artistPosition]) {
      $(this).css("transform", "scale(1.2)");
    } else {
      $(this).css("transform", "none");
    }
  });
}

$(".lockArtist").click(function () {
  if ($(this).hasClass("btn-default")) {
    $(this).removeClass("btn-default").addClass("btn-warning"); // Enable
  } else {
    $(this).removeClass("btn-warning").addClass("btn-default"); // Disable
  }
});

$(".pausePlayer").click(function () {
  if ($(this).hasClass("btn-default")) {
    $(this).removeClass("btn-default").addClass("btn-warning"); // Enable
    player.pauseVideo();
  } else {
    $(this).removeClass("btn-warning").addClass("btn-default"); // Disable
    player.playVideo();
  }
});

function addThisVideoToListenHistory(currentVideoTitle) {
  $(".listenHistory").append("<li>" + currentVideoTitle + "</li>");
  $(".clearListenHistoryBtn").show();
}

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
});

$("#initialSearchInput").click(function () {
  initialSearchInput.value = "";
  clearDisplayedResults();
});

function clearDisplayedResults() {
  $(".lockArtist").removeClass("btn-warning").addClass("btn-default"); // Disable
  if (currentVideoTitle !== undefined) {
    addThisVideoToListenHistory(currentVideoTitle);
    currentVideoTitle = undefined;
  }
}

$(".clearListenHistoryBtn").click(function () {
  $(".listenHistory").slideUp("slow", function () {
    $(".clearListenHistoryBtn").fadeOut("slow", function () {
      $(".listenHistory").html("").show();
    });
  });
});

$("button").click(function () {
  $(this).blur();
});

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