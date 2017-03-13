"use strict";

var similarArtists = {
  results: [{ "name": undefined }],
};

var currentPlayerInfo = {
  artist: function () {
    if (similarArtists.results.length > 0) {
      return similarArtists.results[similarArtists.artistPosition].name;
    }
  }
};

var listenHistory = {
  getCurrentPlayerInfo: function () {
    this.previousVideos.push({
      artist: currentPlayerInfo.artist(),
      videoTitle: currentPlayerInfo.videoTitle,
      videoID: currentPlayerInfo.videoID,
      videoDescription: currentPlayerInfo.videoDescription
    });
    var videoTitleEdited = currentPlayerInfo.videoTitle.replace(currentPlayerInfo.artist(), "");
    this.titlesOnly.push(videoTitleEdited.replace(/[^0-9a-z]/gi, ""));
  },
  previousVideos: [],
  titlesOnly: [],
  mixtape: []
};


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

function runSearch() {
  var searchInput = $("#initialSearchInput").val().toLowerCase();
  if (searchInput !== similarArtists.results[0].name && searchInput !== "") {
    similarArtists.artistPosition = 0;
    similarArtists.results = [{ "name": searchInput, "frequency": 100, "artistImage": undefined }];
    runSpotifySearch(searchInput); // Located in spotifyMethod.js
    $(".subheading").hide();
    $(".nowPlayingSection").show();
    $(".customPlayerUI").css("visibility", "visible");
    $(".relevanceColorScale").show();
  }
}


function displayResults() {
  $(".allSearchResults").html("");
  var forEachCount = 0;
  similarArtists.results.forEach(function (result) {
    forEachCount++;
    var relevance = assignRelevanceClassForColorScale(result.frequency);
    var individualResultBtnHTMLSuffix = relevance + "'><span>" + result.name.replace(/"/g, "") + "</span><button class='deleteArtistResultBtn btn btn-sm btn-default'>✖</span></button></li>";
    var individualResultBtnHTML = "<li class='individualResult " + individualResultBtnHTMLSuffix;

    if (forEachCount <= similarArtists.artistPosition) {
      individualResultBtnHTML = "<li class='individualResult previousResults " + individualResultBtnHTMLSuffix;
    } else if (forEachCount === similarArtists.artistPosition + 1) {
      individualResultBtnHTML = "<li class='individualResult highlighted " + individualResultBtnHTMLSuffix;
    } else if (forEachCount > similarArtists.artistPosition + 10) {
      individualResultBtnHTML = "<li class='individualResult additionalResults " + individualResultBtnHTMLSuffix;
    }
    $(".allSearchResults").append(individualResultBtnHTML);
  });
  $(".highlighted").css("background-image", "url(" + similarArtists.results[similarArtists.artistPosition].artistImage.url + ")");
  adjustPreviousAndAdditionalResultsBtnState();
  displayMixtapeSection();
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

function adjustPreviousAndAdditionalResultsBtnState() {
  if ($(".previousResults").length > 0) {
    $(".showPreviousResultsBtn").html("Show previous results").show();
  } else {
    $(".showPreviousResultsBtn").hide();
  }
  if ($(".additionalResults").length > 0) {
    $(".showAdditionalResultsBtn").html("Show more results").show();
  } else {
    $(".showAdditionalResultsBtn").hide();
  }
}

$(".showPreviousResultsBtn").click(function () {
  if ($(".previousResults").css("display") === "none") {
    $(".previousResults").slideDown("slow", function () {
      $(".showPreviousResultsBtn").html("Hide previous results");
    });
  } else {
    $(".previousResults").slideUp("slow", function () {
      $(".showPreviousResultsBtn").html("Show previous results");
    });
  }
});

$(".showAdditionalResultsBtn").click(function () {
  if ($(".additionalResults").css("display") === "none") {
    $(".additionalResults").slideDown("slow");
    $(".showAdditionalResultsBtn").html("Show less results");
  } else {
    $(".additionalResults").slideUp("slow");
    $(".showAdditionalResultsBtn").html("Show more results");
  }
});

(function skipToThisArtist() {
  $("ol").on("click", "li:not(.mixtapeTitle)", function (event) {
    event.stopPropagation();
    if ($(this).html().indexOf("<span>") !== -1) {
      similarArtists.artistPosition = $(this).index();
      findAndPlayVideo(); // Located in search.js
    }
  });
})();

(function deleteThisArtistFromSimilarArtists() {
  $(".allSearchResults").on("click", "button", function (event) {
    event.stopPropagation(event);
    if ($(this).html() === "✖") {
      var locationOfArtistClicked = $(this).parent().index();
      similarArtists.results.splice(locationOfArtistClicked, 1);
      $(this).parent().fadeOut("slow", function () {
        if (locationOfArtistClicked === similarArtists.artistPosition) {
          similarArtists.artistPosition--;
          cueNextVideo();
        } else {
          displayResults();
        }
      });
    }
  });
})();

function cueNextVideo() {
  if ($(".lockArtistBtn").hasClass("btn-default")) { // "Lock artist" is disabled
    $(".allSearchResults li").eq(similarArtists.artistPosition).slideUp("fast");
    similarArtists.artistPosition++;
  }
  findAndPlayVideo();
  clearInterval(currentPlayerInfo.playbackTimer);
  currentPlayerInfo.playbackTimer = null;
  $(".currentTime").html("0:00");
  $(".trackLength").html(" / 0:00");
  $(".addToMixtapeBtn").removeClass("disabled");
}

(function setupDragAndDropForOrderedLists() {
  $("ol").sortable({
    placeholder: {
      element: function () {
        return $("<li class='placeholderForDrag glyphicon glyphicon-share-alt'></li>");
      },
      update: function () {
        return;
      }
    }
  });
  $("ol").disableSelection();

  $("ol").on("mousedown", "li", function () {
    var elementClicked = $(this);
    var ignoreQuickClicksTimer;
    elementClicked.mouseup(() => clearTimeout(ignoreQuickClicksTimer));
    ignoreQuickClicksTimer = setTimeout(function () {
      elementClicked.off("mouseup");
      elementClicked.addClass("itemBeingDragged", 100); // jQuery UI feature, animates CSS class style differences
      var originalPosition = elementClicked.index();
      var newPosition;
      $("ol").on("mousemove", "li", function () {
        newPosition = $(".placeholderForDrag").index();
        if (originalPosition === similarArtists.artistPosition) {
          $(".individualResult").each(function () {
            if ($(this).index() < newPosition) {
              $(this).css("opacity", "0.7");
            } else {
              $(this).css("opacity", "1");
            }
          });
        }
      });

      $("ol").on("mouseup", "li", function () {
        $("ol").off("mousemove");
        $("ol").off("mouseup");
        if (newPosition === undefined) {
          newPosition = originalPosition;
        }
        // similarArtists <ol>
        if (elementClicked.hasClass("individualResult")) {
          var artistObjectBeingMoved = similarArtists.results.splice(originalPosition, 1)[0];
          similarArtists.results.splice(newPosition, 0, artistObjectBeingMoved);
          if (originalPosition === similarArtists.artistPosition) {
            similarArtists.artistPosition = newPosition;
          }
        }
        // mixtape <ol>
        if (!elementClicked.hasClass("individualResult")) {
          var mixtapeTitleBeingMoved = listenHistory.mixtape.splice(originalPosition, 1)[0];
          listenHistory.mixtape.splice(newPosition, 0, mixtapeTitleBeingMoved);
        }
        elementClicked.removeClass("itemBeingDragged", 75, function () {
          displayResults();
        });
      });
    }, 200);
  });
})();

function displayMixtapeSection() {

  if (listenHistory.mixtape.length > 0) {
    $(".mixtapeViewableList").html("");
    listenHistory.mixtape.forEach(function (track) {
      var mixtapeTrackHTML = "<li class='mixtapeTitle'><span>" + track.replace(/"/g, "") + "</span><button class='deleteVideoFromHistoryBtn btn btn-sm btn-info'>✖</button></li>";
      $(".mixtapeViewableList").append(mixtapeTrackHTML);
    });
    $(".createMixtapeBtn").show();
    $(".clearMixtapeBtn").show();
    if (!currentPlayerInfo.userLoggedIn) {
      $(".pre-auth").show();
    }
  } else {
    $(".mixtapePlaceholder").show();
    $(".createMixtapeBtn").hide();
    $(".clearMixtapeBtn").hide();
  }
}

(function assignDeleteVideoFromHistoryBtnFunctionality() {
  $(".mixtapeViewableList").on("click", "button", function () {
    listenHistory.mixtape.splice($(this).parent("li").index(), 1);
    $(this).parent("li").fadeOut("fast", function () {
      displayMixtapeSection();
      $(".addToMixtapeBtn").removeClass("disabled");
    });
  });
})();

$(".addToMixtapeBtn").click(function () {
  if (!$(this).hasClass("disabled") && currentPlayerInfo.videoTitle !== undefined) {
    $(".addToMixtapeBtn").addClass("disabled");
    listenHistory.mixtape.push(currentPlayerInfo.videoTitle);
    displayMixtapeSection();
  }
});

$(".createMixtapeBtn").click(function () {
  if (currentPlayerInfo.userLoggedIn) {
    autoCreatePlaylist();
    $(this).addClass("disabled");
    $(this).html("Now creating your Mixtape");
  }
});

$(".clearMixtapeBtn").click(function () {
  listenHistory.mixtape = [];
  $(".mixtapeViewableList").slideUp("slow", function () {
    $(".createMixtapeBtn").fadeOut("slow");
    $(".viewMixtape").fadeOut("slow");
    $(".pre-auth").fadeOut("slow");
    $(".clearMixtapeBtn").fadeOut("slow", function () {
      $(".addToMixtapeBtn").removeClass("disabled");
      $(".mixtapeViewableList").html("").show();
      displayMixtapeSection();
    });
  });
});


// Player Controls
$(".pauseVideoBtn").click(function () {
  if ($(".pauseVideoBtn span").hasClass("glyphicon-pause")) {
    $(".pauseVideoBtn span").removeClass("glyphicon-pause").addClass("glyphicon-play");
    currentPlayerInfo.player.pauseVideo();
  } else {
    $(".pauseVideoBtn span").removeClass("glyphicon-play").addClass("glyphicon-pause");
    currentPlayerInfo.player.playVideo();
  }
});

$(".nextVideoBtn").click(function () {
  cueNextVideo();
});

$(".lockArtistBtn").click(function () {
  if ($(this).hasClass("btn-default")) {
    $(this).removeClass("btn-default").addClass("btn-warning"); // Enable
  } else {
    $(this).removeClass("btn-warning").addClass("btn-default"); // Disable
  }
});

$(".showPlayerBtn").click(function () {
  if ($(".videoWrapper").css("display") === "none") {
    $(".videoWrapper").slideDown("slow", function () {
      $(".showPlayerBtn").html("<span class='glyphicon glyphicon-collapse-down'></span> Hide player");
    });
  } else {
    $(".videoWrapper").slideUp("slow", function () {
      $(".showPlayerBtn").html("<span class='glyphicon glyphicon-collapse-up'></span> Show player");
    });
  }
});

$("button").click(function () {
  $(this).blur();
});