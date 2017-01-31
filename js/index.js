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

function runSearch() {
  allResults = [];
  fullGenreList = [];
  initialArtist = document.getElementById("initialSearchInput").value.toLowerCase();
  getInitialArtistFullGenreListViaSpotify(initialArtist);
  $(".subheading").slideUp("fast");
}

var combineSearchMethodsCount = 0;
function combineSpotifyAndAutoSuggestionResults(resultsArray) {
  combineSearchMethodsCount++;
  if (combineSearchMethodsCount === 1) {
    allResults = resultsArray;
  }
  if (combineSearchMethodsCount === 2) {
    combineSearchMethodsCount = 0;
    allResults = allResults.concat(resultsArray);
    if (allResults.length === 0) {
      allResults.push(initialArtist);
      $(".allSearchResults").append("We were weren't able to find similar artists, but here's a result from your search");
      $(".lockArtist").removeClass("btn-default").addClass("btn-warning"); // Enables "Lock artist"
    }
    displayResults(allResults);
  }
}

function displayResults(allResults) {
  createAndRunVideoSearch(allResults[0]).then(function (result) {
    return assignCurrentVideoFromSearchResults(result);
  }).then(function (result) {
    prepareYouTubePlayer();
  });

  var forEachCount = 0;
  allResults.forEach(function (result) {
    forEachCount++;
    if (forEachCount <= 15) {
      $(".allSearchResults").append(
        '<button class="btn-link"><li class="individualResult">' + result + '</li></button>'
      );
    } else {
      $(".additionalResults").append(
        '<button class="btn-link "><li class="individualResult">' + result + '</li></button>'
      );
    }
    if (forEachCount === 15) {
      $(".allSearchResults").append('<br><button class="moreResultsBtn btn btn-info">More results</button>');
      $(".allSearchResults").append('<div class="additionalResults"></div>');
    }
  });

  $(".individualResult").click(function () {
    addThisVideoToListenHistory(currentVideoTitle);
    artistPosition = allResults.indexOf($(this).html());
    findAndPlayVideo(allResults[artistPosition]);
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

var artistPosition = 0;
function queNextVideo(allResults) {
  addThisVideoToListenHistory(currentVideoTitle);
  if ($(".lockArtist").hasClass("btn-default")) { // If "Lock artist" is disabled
    artistPosition++;
  }
  findAndPlayVideo(allResults[artistPosition]);
}


$(".lockArtist").click(function () {
  if ($(this).hasClass("btn-default")) {
    $(this).removeClass("btn-default").addClass("btn-warning"); // Enable
  } else {
    $(this).removeClass("btn-warning").addClass("btn-default"); // Disable
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
  $(".nowPlaying").html("");
  $(".allSearchResults").html("");
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