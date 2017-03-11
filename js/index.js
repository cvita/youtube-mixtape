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
    var regex = new RegExp("[^0-9a-z]|" + currentPlayerInfo.artist(), "gi");
    this.titlesOnly.push(currentPlayerInfo.videoTitle.replace(regex, ''));
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
  var searchInput = document.getElementById("initialSearchInput").value.toLowerCase();
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
    var individualResultBtnHTMLSuffix = relevance + "'><span>" + result.name + "</span><button class='deleteArtistResultBtn btn btn-sm btn-default'>✖</span></button></li>";
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
  if ($(this).html() === "Show more results") {
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
      findAndPlayVideo();
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
          queNextVideo();
        } else {
          $(document).ready(() => displayResults()); // QUESTION: Does this make sense?
        }
      });
    }
  });
})();

function queNextVideo() {
  if ($(".lockArtistBtn").hasClass("btn-default")) { // If "Lock artist" is disabled
    $(".allSearchResults li").eq(similarArtists.artistPosition).slideUp("fast");
    similarArtists.artistPosition++;
  }
  findAndPlayVideo(); // Located in search.js
  clearInterval(currentPlayerInfo.playbackTimer);
  currentPlayerInfo.playbackTimer = null;
  $(".currentTime").html("0:00");
  $(".trackLength").html(" / 0:00");
  $(".addToMixtapeBtn").removeClass("disabled").html("Add to Mixtape");
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

  var ignoreQuickClicksTimer;
  $("ol").on("mousedown", "li", function () {
    var elementClicked = $(this);
    ignoreQuickClicksTimer = setTimeout(function () {
      elementClicked.addClass("itemBeingDragged", 100);
      var originalPosition = elementClicked.index();
      var artistObjectBeingMoved = similarArtists.results[originalPosition];
      var newPosition;
      $("ol").on("mousemove", "li", function () {
        newPosition = $(".placeholderForDrag").index();
      });
      $("ol").on("mouseup", "li", function () {
        if (elementClicked.hasClass("individualResult")) {
          $("ol").off("mousemove");
          $("ol").off("mouseup");
          if (newPosition) {
            similarArtists.results.splice(originalPosition, 1);
            similarArtists.results.splice(newPosition, 0, artistObjectBeingMoved);
            if (originalPosition === similarArtists.artistPosition) {
              similarArtists.artistPosition = newPosition;
            }
          }
          elementClicked.removeClass("itemBeingDragged", 75, function () {
            $(document).ready(() => displayResults());
          });
        } else {
          if (newPosition === undefined) {
            newPosition = originalPosition;
          }
          var mixtapeTitleBeingMoved = listenHistory.mixtape.splice(originalPosition, 1)[0];
          listenHistory.mixtape.splice(newPosition, 0, mixtapeTitleBeingMoved);
          elementClicked.removeClass("itemBeingDragged", 75, function () {
            $(document).ready(() => displayMixtapeSection());
          });
        }
      });
    }, 200);
  });

  $("ol").on("click", "li", function () {
    clearTimeout(ignoreQuickClicksTimer);
  });
})();


function displayMixtapeSection() {
  $(".mixtapeViewableList").html("");
  if (listenHistory.mixtape.length > 0) {
    listenHistory.mixtape.forEach(function (track) {
      var mixtapeTrackHTML = "<li class='mixtapeTitle'><span>" + track + "</span><button class='deleteVideoFromHistoryBtn btn btn-sm btn-info'>✖</button></li>"
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
      $(".addToMixtapeBtn").removeClass("disabled").html("Add to Mixtape");
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
    $(".clearMixtapeBtn").fadeOut("slow", function () {
      $(".mixtapeViewableList").html("").show();
      displayMixtapeSection();
    });
  });
});


// Player Controls
$(".pausePlayerBtn").click(function () {
  if ($(".pausePlayerBtn span").hasClass("glyphicon-pause")) {
    $(".pausePlayerBtn span").removeClass("glyphicon-pause").addClass("glyphicon-play");
    currentPlayerInfo.player.pauseVideo();
  } else {
    $(".pausePlayerBtn span").removeClass("glyphicon-play").addClass("glyphicon-pause");
    currentPlayerInfo.player.playVideo();
  }
});

$(".nextVideoBtn").click(function () {
  queNextVideo();
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
