"use strict";

var initialArtist;
var fullGenreList;
var allResults;

$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    runSearch();
    this.blur();
  }
});

$(".searchBtn").click(function () {
  runSearch();
});

function runSearch() {
  allResults = [];
  fullGenreList = [];
  initialArtist = document.getElementById("initialSearchInput").value.toLowerCase();
  getInitialArtistFullGenreList(initialArtist);
  $(".subheading").slideUp("fast");
}

var combineSearchMethodsCounter = 0;
function combineSpotifyAndAutoSuggestionResults(resultsArray) {
  if (combineSearchMethodsCounter === 0) {
    allResults = resultsArray;
  }
  if (combineSearchMethodsCounter === 1) {
    allResults = allResults.concat(resultsArray);
    displayResults(allResults);
    combineSearchMethodsCounter = 0;
  }
  combineSearchMethodsCounter++;
}

function displayResults(allResults) {
  createSearch(allResults[0]);
  beginPlayingFromResults();

  var forEachCount = 0;
  allResults.forEach(function (result) {
    forEachCount++;
    if (forEachCount <= 15) {
      $(".allSearchResults").append(
        '<button class="btn-link"><li class="individualResult">' + result + '</li></button>'
      );
      if (forEachCount === 15) {
        $(".allSearchResults").append('<br><button class="moreResultsBtn btn btn-info">More results</button>');
        $(".allSearchResults").append('<div class="additionalResults"></div>');
      }
    } else {
      $(".additionalResults").append(
        '<button class="btn-link "><li class="individualResult">' + result + '</li></button>'
      );
    }
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

  $(".individualResult").click(function () {
    addThisVideoToListenHistory(videoTitle);
    arrayCount = allResults.indexOf($(this).html());
    createSearch(allResults[arrayCount]);
    setTimeout(function () { // Figure out a better asynch technique (this is a bandaid to fix a race condition)
      player.loadVideoById(videoToPlay);
    }, 500);
  });
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

var arrayCount = 0;
function queNextVideo(arrayToQueueFrom) {
  addThisVideoToListenHistory(videoTitle);
  arrayCount++;
  console.log(arrayToQueueFrom[arrayCount]);
  createSearch(arrayToQueueFrom[arrayCount]);
  setTimeout(function () {
    player.loadVideoById(videoToPlay);
  }, 500);
}

function addThisVideoToListenHistory(currentVideoTitle) {
  $(".listenHistory").append("<li>" + currentVideoTitle + "</li>");
  $(".clearListenHistoryBtn").show();
}

$(".nextVideoBtn").click(function () {
  if ($(".lockArtist").hasClass("btn-default")) {
    queNextVideo(allResults);
  } else {
    addThisVideoToListenHistory(videoTitle);
    createSearch(allResults[arrayCount]);
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
});

$("button").click(function () {
  $(this).blur();
});

$("#initialSearchInput").click(function () {
  initialSearchInput.value = "";
  clearDisplayedResults();
});

function clearDisplayedResults() {
  $(".searchedFor").html("");
  $(".allSearchResults").html("");
  $(".numberOfResultsFound").html("");
  $(".clearListenHistoryBtn").hide();
}

$(".clearListenHistoryBtn").click(function () {
  $(".listenHistory").slideUp("slow", function () {
    $(".clearListenHistoryBtn").fadeOut("slow", function () {
      $(".listenHistory").html("").show();
    });
  });
});


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