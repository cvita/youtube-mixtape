"use strict";

var similarArtists = {
  results: [{ "name": undefined }],
  artistPosition: 0
};

function runSearch() {
  var searchInput = document.getElementById("initialSearchInput").value.toLowerCase();
  if (searchInput !== similarArtists.results[0].name && searchInput !== "") {
    similarArtists.results = [{ "name": searchInput, "frequency": 100 }]; // Ensures searchInput will display as first result
    similarArtists.artistPosition = 0;
    getInitialArtistFullGenreListViaSpotify(searchInput); // See spotifyMethod.js
    $(".subheading").slideUp("fast");
  }
}

function displayResults() {
  $(".customPlayerUI").css("visibility", "visible");
  $(".relevanceColorScale").show();
  $(".allSearchResults").html("");
  var forEachCount = 0;
  similarArtists.results.forEach(function (result) {
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
    for (var i = 0; i < similarArtists.results.length; i++) {
      if (similarArtists.results[i].name === $(this).html()) {
        similarArtists.artistPosition = i;
        break;
      }
    }
    findAndPlayVideo();
    highLightCurrentArtistButton();
  });
}

function highLightCurrentArtistButton() {
  var listItems = $(".allSearchResults li");
  listItems.each(function (li) {
    if ($(this).html() === similarArtists.results[similarArtists.artistPosition].name) {
      $(this).addClass("highlighted");
    } else {
      $(this).removeClass("highlighted");
    }
  });
}

// BUG: Shouldn't be able to que next video until current video has been added to listenHistory
function queNextVideo() {
  if ($(".lockArtist").hasClass("btn-default")) { // If "Lock artist" is disabled
    similarArtists.artistPosition++;
  }
  findAndPlayVideo();
  highLightCurrentArtistButton();
  clearInterval(currentPlayerInfo.playbackTimer);
  currentPlayerInfo.playbackTimer = null;
  $(".currentTime").html("0:00");
  $(".trackLength").html(" / 0:00");
}


$("#initialSearchInput").click(function () {
  initialSearchInput.value = "";
  $(".searchBtn").removeClass("disabled");
});

$(".searchBtn").click(function () {
  runSearch();
});

$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    runSearch();
    this.blur();
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

$(".nextVideoBtn").click(function () {
  queNextVideo();
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

$(".clearListenHistoryBtn").click(function () {
  listenHistory.previousVideos = [listenHistory.previousVideos.pop()];
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
