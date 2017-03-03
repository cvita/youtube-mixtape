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

function runSearch() {
  var searchInput = document.getElementById("initialSearchInput").value.toLowerCase();
  if (searchInput !== similarArtists.results[0].name && searchInput !== "") {
    similarArtists.artistPosition = 0;
    getInitialArtistFullGenreListViaSpotify(searchInput); // See spotifyMethod.js
    $(".subheading").slideUp("fast", function () {
      $(".addToMixtapeBtn").show();
      $(".customPlayerUI").css("visibility", "visible");
      $(".relevanceColorScale").show();
    });
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
// Todo: mixtape section button functionality has been disabled.
(function assignFunctionalityToIndividualResultBtns() {
  $("ol").on("click", ":not(.showAdditionalResultsBtn .showPreviousResultsBtn)", function (event) {
    event.stopPropagation();
    var artistClicked = ($(this).html().indexOf("<span>") !== -1 ?
      $(this).index() :
      $(this).parent(".allSearchResults li").index()
    );
    if ($(this).html() !== "✖") {
      similarArtists.artistPosition = artistClicked;
      findAndPlayVideo(); // See search.js
    } else {
      $(this).parent().fadeOut("fast", function () {
        similarArtists.results.splice(artistClicked, 1);
        displayResults();
        if (artistClicked === similarArtists.artistPosition) {
          similarArtists.artistPosition--;
          queNextVideo();
        }
      });
    }
  });
})();

(function assignDragAndDropFunctionalityToIndividualResultBtns() {
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
        $("ol").off("mousemove");
        $("ol").off("mouseup");
        if (newPosition) {
          similarArtists.results.splice(originalPosition, 1);
          similarArtists.results.splice(newPosition, 0, artistObjectBeingMoved);
          if (originalPosition === similarArtists.artistPosition) {
            similarArtists.artistPosition = newPosition;
          }
        }
        $(document).ready(function () {
          elementClicked.removeClass("itemBeingDragged", 75, function () {
            displayResults();
          });
        });
      });
    }, 200);
  });

  $("ol").on("click", "li", function () {
    clearTimeout(ignoreQuickClicksTimer);
  });
})();

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

function queNextVideo() {
  if ($(".lockArtistBtn").hasClass("btn-default")) { // If "Lock artist" is disabled
    $(".allSearchResults li").eq(similarArtists.artistPosition).slideUp("fast");
    similarArtists.artistPosition++;
  }
  findAndPlayVideo();
  clearInterval(currentPlayerInfo.playbackTimer);
  currentPlayerInfo.playbackTimer = null;
  $(".currentTime").html("0:00");
  $(".trackLength").html(" / 0:00");
}

$(".addToMixtapeBtn").click(function () {
  if (currentPlayerInfo.videoTitle !== undefined) {
    $(".mixtapePlaceholder").hide();
    listenHistory.mixtape.push(currentPlayerInfo.videoTitle);
    $(".mixtapeViewableList").append("<li><span>" + currentPlayerInfo.videoTitle + "</span><button class='deleteVideoFromHistoryBtn btn btn-sm btn-info'>✖</button></li>");
    assignDeleteVideoFromHistoryBtnFunctionality();
    displayMixtapeSection();
  }
});

function displayMixtapeSection() {
  if (listenHistory.mixtape.length > 0) {
    $(".mixtapePlaceholder").hide();
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

function assignDeleteVideoFromHistoryBtnFunctionality() {
  $(".deleteVideoFromHistoryBtn").click(function () {
    var videoTitle = $(this).parent(".mixtapeViewableList li")[0].innerHTML;
    $(".mixtapeViewableList li").each(function (li) {
      if ($(this).html() === videoTitle) {
        $(this).fadeOut("slow");
        for (var i = 0; i < listenHistory.previousVideos.length; i++) {
          if ($(this).html().indexOf(listenHistory.previousVideos[i].videoTitle) !== -1) {
            listenHistory.previousVideos.splice(i, 1);
            break;
          }
        }
      }
    });
  });
}


// User Interface Functionality
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

$(".pausePlayerBtn").click(function () {
  if ($(this).hasClass("btn-default")) {
    $(this).removeClass("btn-default").addClass("btn-warning"); // Enable
    currentPlayerInfo.player.pauseVideo();
  } else {
    $(this).removeClass("btn-warning").addClass("btn-default"); // Disable
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
  if ($(this).html() === "Show player") {
    $(".videoWrapper").slideDown("slow", function () {
      $(".showPlayerBtn").html("Hide player");
    });
  } else {
    $(".videoWrapper").slideUp("slow", function () {
      $(".showPlayerBtn").html("Show player");
    });
  }
});

$(".clearMixtapeBtn").click(function () {
  listenHistory.mixtape = [];
  $(".mixtapeViewableList").slideUp("slow", function () {
    $(".createMixtapeBtn").fadeOut("slow");
    $(".viewMixtape").fadeOut("slow");
    $(".clearMixtapeBtn").fadeOut("slow", function () {
      $(".mixtapeViewableList").html("").show();
      displayMixtapeSection(); // Not sure why this isn't displaying placeholder
    });
  });
});

$(".createMixtapeBtn").click(function () {
  if (currentPlayerInfo.userLoggedIn) {
    autoCreatePlaylist();
    $(this).addClass("disabled");
    $(this).html("Now creating your Mixtape");
  }
});

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

$("button").click(function () {
  $(this).blur();
});
