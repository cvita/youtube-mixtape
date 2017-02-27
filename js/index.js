"use strict";

var similarArtists = {
  results: [{ "name": undefined }],
  artistPosition: 0
};

function runSearch() {
  var searchInput = document.getElementById("initialSearchInput").value.toLowerCase();
  if (searchInput !== similarArtists.results[0].name && searchInput !== "") {
    getInitialArtistFullGenreListViaSpotify(searchInput); // See spotifyMethod.js
    $(".subheading").slideUp("fast");
    $(".showPriorResults").addClass("disabled");
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
    var individualResultBtnHTMLSuffix = relevance + "'><span>" + result.name + "</span><button class='deleteArtistResultBtn btn btn-sm btn-default'>✖</span></button></li>";
    var individualResultBtnHTML = "<li class='individualResult " + individualResultBtnHTMLSuffix;
    if (forEachCount <= similarArtists.artistPosition) {
      individualResultBtnHTML = "<li class='individualResult priorResults " + individualResultBtnHTMLSuffix;
    } else if (forEachCount > similarArtists.artistPosition + 10) {
      individualResultBtnHTML = "<li class='individualResult additionalResults " + individualResultBtnHTMLSuffix;
    }
    $(".allSearchResults").append(individualResultBtnHTML);
  });
  highLightCurrentArtistButton();
  assignDragAndDropForSimilarArtistsList();

  if ($(".priorResults").length > 0) {
    $(".showPriorResults").html("Show previous artists").show();
  } else {
    $(".showPriorResults").hide();
  }
  if ($(".additionalResults").length > 0) {
    $(".moreResultsBtn").html("Show more results").show();
  } else {
    $(".moreResultsBtn").hide();
  }
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

(function assignFunctionalityToIndividualResultBtns() {
  $("ol").on("click", ":not(.moreResultsBtn)", function (event) {
    event.stopPropagation();
    var artistClicked = ($(this).html().indexOf("<span>") !== -1 ?
      $(this).index() :
      $(this).parent(".allSearchResults li").index()
    );
    if ($(this).html() !== "✖") {
      similarArtists.artistPosition = artistClicked;
      findAndPlayVideo();
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

function assignDragAndDropForSimilarArtistsList() {
  var delayBeforeEnablingDragAndDrop;
  var itemBeingDragged;
  var itemBeingDraggedPosition;
  $(".allSearchResults li")
    .on('mousedown', function () {
      itemBeingDragged = $(this);
      itemBeingDraggedPosition = $(this).index();
      console.log(itemBeingDraggedPosition);
      delayBeforeEnablingDragAndDrop = setTimeout(reorderSimilarArtists, 125);
    })
    .on('mouseup', function () {
      clearTimeout(delayBeforeEnablingDragAndDrop);
    });

  function reorderSimilarArtists() {
    var removedArtistObj = similarArtists.results.splice(itemBeingDraggedPosition, 1)[0];
    itemBeingDragged.addClass("draggingItem");

    $(".allSearchResults li").one("mouseup", function () {
      setTimeout(function () {
        itemBeingDragged.removeClass("draggingItem");
        var newPosition = itemBeingDragged.index();
        similarArtists.results.splice(newPosition, 0, removedArtistObj);
        if (itemBeingDraggedPosition === similarArtists.artistPosition) {
          similarArtists.artistPosition = newPosition;
        }
        displayResults();
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

// BUG: Shouldn't be able to que next video until current video has been added to listenHistory
function queNextVideo() {
  if ($(".lockArtist").hasClass("btn-default")) { // If "Lock artist" is disabled
    $(".allSearchResults li").eq(similarArtists.artistPosition).slideUp("fast");
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

$(".showPriorResults").click(function () {
  if ($(".priorResults").css("display") === "none") {
    $(".priorResults").slideDown("slow", function () {
      $(".showPriorResults").html("Hide previous artists");
    });
  } else {
    $(".priorResults").slideUp("slow", function () {
      $(".showPriorResults").html("Show previous artists");
    });
  }
});

$(".moreResultsBtn").click(function () {
  if ($(this).html() === "Show more results") {
    $(".additionalResults").slideDown("slow");
    $(".moreResultsBtn").html("Show less results");
  } else {
    $(".additionalResults").slideUp("slow");
    $(".moreResultsBtn").html("Show more results");
  }
});

$("button").click(function () {
  $(this).blur();
});
