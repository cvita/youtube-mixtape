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
    var individualResultBtn = "<li class='individualResult " + relevance + "'><span>" + result.name + "</span><button class='deleteArtistResultBtn btn btn-sm btn-default'>✖</span></button></li>";

    if (forEachCount <= 15) {
      $(".allSearchResults").append(individualResultBtn);
    }
    if (forEachCount === 15) {
      $(".allSearchResults").append('<div class="additionalResults"></div>');
      $(".allSearchResults").append('<br><button class="moreResultsBtn btn btn-block btn-default">Show more results</button>');
      assignFunctionalityToMoreResultsBtn();
    }
    if (forEachCount > 15) {
      $(".additionalResults").append(individualResultBtn);
    }
  });
  assignDragAndDropForSimilarArtistsList();
  assignFunctionalityToIndividualResultBtns();
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
    if ($(this).html() === "Show more results") {
      $(".additionalResults").slideDown("slow");
      $(".moreResultsBtn").html("Show less results");
    } else {
      $(".additionalResults").slideUp("slow");
      $(".moreResultsBtn").html("Show more results");
    }
  });
}

function assignDragAndDropForSimilarArtistsList() {
  var delayBeforeEnablingDragAndDrop;
  var itemBeingDragged;
  $(".allSearchResults li")
    .on('mousedown', function () {
      itemBeingDragged = $(this);
      delayBeforeEnablingDragAndDrop = setTimeout(reorderSimilarArtistsToMatchDOM, 125);
    })
    .on('mouseup', function () {
      clearTimeout(delayBeforeEnablingDragAndDrop);
    });

  function reorderSimilarArtistsToMatchDOM() {
    itemBeingDragged.addClass("draggingItem");
    $(".allSearchResults li").mouseup(function () {
      var tempArray = [];
      setTimeout(function () {
        $(".allSearchResults li").each(function (li) {
          for (var i = 0; i < similarArtists.results.length; i++) {
            if ($(this).text().slice(0, -1) === similarArtists.results[i].name) {
              tempArray.push(similarArtists.results[i]);
            }
          }
        });
        similarArtists.results = tempArray;
        itemBeingDragged.removeClass("draggingItem");
        $(".allSearchResults").off("mouseup");
      }, 10);
    });
  }

  $(".allSearchResults").disableSelection();
  $(".allSearchResults").sortable({
    placeholder: {
      element: function () {
        return $("<li><div class='placeHolderForDrag'><span class='glyphicon glyphicon-share-alt'></div></li>")[0];
      },
      update: function () {
        return;
      }
    }
  });
}

function assignFunctionalityToIndividualResultBtns() {
  $("ol").on("click", ":not(.moreResultsBtn)", function (event) {
    event.stopPropagation();
    if ($(this).html() !== "✖") {
      similarArtists.artistPosition = $(this).index();
      findAndPlayVideo();
    } else {
      var artistPositionToRemove = $(this).parent(".allSearchResults li").index();
      $(this).parent().fadeOut("fast", function () {
        similarArtists.results.splice(artistPositionToRemove, 1);
        displayResults();
        if (artistPositionToRemove === similarArtists.artistPosition) {
          similarArtists.artistPosition--; // Bug fix. Used to skip very next artist
          queNextVideo();
        }
      });
    }
  });
}

// BUG: Shouldn't be able to que next video until current video has been added to listenHistory
function queNextVideo() {
  if ($(".lockArtist").hasClass("btn-default")) { // If "Lock artist" is disabled
    similarArtists.artistPosition++;
  }
  findAndPlayVideo();
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
  if (currentPlayerInfo.userLoggedIn) {
    autoCreatePlaylist();
    $(this).addClass("disabled");
    $(this).html("Now creating your Mixtape");
  }
});

$("button").click(function () {
  $(this).blur();
});
