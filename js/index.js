"use strict";

var initialArtist; // Only useful as a global var to auto-complete method
var fullGenreList; // Only useful as a global var to auto-complete method
var allResults;
var artistPosition;
var listenHistory = [];

$(".searchBtn").click(function () {
  runSearch();
});

$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    runSearch();
    this.blur();
  }
});

function runSearch() {
  var searchInput = document.getElementById("initialSearchInput").value.toLowerCase();
  if (searchInput !== initialArtist && searchInput !== "") {
    initialArtist = searchInput;
    fullGenreList = [];
    getInitialArtistFullGenreListViaSpotify(initialArtist); // See spotifyMethod.js
    $(".subheading").slideUp("fast");
  }
}

function beginPlayingFirstVideo(array) {
  allResults = array;
  artistPosition = 0;
  findAndPlayVideo(allResults[artistPosition].name);
  displayResults(allResults);
  $(".customPlayerUI").css("visibility", "visible");
  $(".relevanceColorScale").show();
}

function findAndPlayVideo(artist) {
  createAndRunVideoSearch(artist).then(function (result) {
    return assignCurrentVideoFromSearchResults(result);
  }).then(function (result) {
    return playCurrentVideo(result);
  }).then(function (result) {
    console.log("JS Promise chain complete. Now playing videoID: " + result);
  });
}

function displayResults(allResults) {
  $(".allSearchResults").html("");
  var forEachCount = 0;
  allResults.forEach(function (result) {
    forEachCount++;
    var relevance = assignRelevanceClassForColorScale(result.frequency);
    var individualResultBtn = '<button class="btn-link"><li class="individualResult ' + relevance + '">' + result.name + '</li></button>';
    if (forEachCount <= 15) {
      $(".allSearchResults").append(individualResultBtn);
    }
    if (forEachCount === 15) {
      $(".allSearchResults").append('<br><button class="moreResultsBtn btn btn-default btn-sm">More results</button>');
      assignFunctionalityToMoreResultsBtn();
      $(".allSearchResults").append('<div class="additionalResults"></div>');
    }
    if (forEachCount > 15) {
      $(".additionalResults").append(individualResultBtn);
    }
  });
  assignFunctionalityToIndividualResultBtns();
  highLightCurrentArtistButton();
}

function assignRelevanceClassForColorScale(frequency) {
  if (frequency >= 5) {
    return "relevance5of5";
  } else if (frequency === 4) {
    return "relevance4of5";
  } else if (frequency === 3) {
    return "relevance3of5";
  } else if (frequency === 2) {
    return "relevance2of5";
  } else {
    return "relevance1of5";
  }
}

function assignFunctionalityToMoreResultsBtn() {
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

function assignFunctionalityToIndividualResultBtns() {
  $(".individualResult").click(function () {
    for (var i = 0; i < allResults.length; i++) {
      if (allResults[i].name === $(this).html()) {
        artistPosition = i;
        break;
      }
    }
    findAndPlayVideo(allResults[artistPosition].name);
    highLightCurrentArtistButton();
  });
}

function highLightCurrentArtistButton() {
  var listItems = $(".allSearchResults li");
  listItems.each(function (li) {
    if ($(this).html() === allResults[artistPosition].name) {
      $(this).addClass("highlighted");
    } else {
      $(this).removeClass("highlighted");
    }
  });
}

$(".nextVideoBtn").click(function () {
  queNextVideo(allResults);
});

function queNextVideo(allResults) {
  if ($(".lockArtist").hasClass("btn-default")) { // If "Lock artist" is disabled
    artistPosition++;
  }
  findAndPlayVideo(allResults[artistPosition].name);
  highLightCurrentArtistButton();
  clearInterval(playbackTimer);
  playbackTimer = "Initial playback not started";
  $(".currentTime").html("0:00");
  $(".trackLength").html(" / 0:00");
}

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

$(".pausePlayer").click(function () {
  if ($(this).hasClass("btn-default")) {
    $(this).removeClass("btn-default").addClass("btn-warning"); // Enable
    player.pauseVideo();
  } else {
    $(this).removeClass("btn-warning").addClass("btn-default"); // Disable
    player.playVideo();
  }
});

$("#initialSearchInput").click(function () {
  initialSearchInput.value = "";
  $(".searchBtn").removeClass("disabled");
});

$(".clearListenHistoryBtn").click(function () {
  listenHistory = [listenHistory.pop()];
  $(".listenHistory").slideUp("slow", function () {
    $(".createMixtape").fadeOut("slow");
    $(".viewMixtape").fadeOut("slow");
    $(".clearListenHistoryBtn").fadeOut("slow", function () {
      $(".listenHistory").html("").show();
      $(".createMixtape").html("Create this Mixtape").removeClass("disabled");
    });
  });
});

$(".createMixtape").click(function () {
  autoCreatePlaylist();
  $(this).addClass("disabled");
  $(this).html("Now creating your Mixtape");
});

$("button").click(function () {
  $(this).blur();
});
