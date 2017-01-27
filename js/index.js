"use strict";

var initialSearchKeyword;
var fullGenreList;
var similarArtistsSpotify;
var similarArtistsGoogle;

function runSearch() {
  fullGenreList = [];
  similarArtistsSpotify = [];
  similarArtistsGoogle = [];
  initialSearchKeyword = document.getElementById("initialSearchInput").value.toLowerCase();
  getInitialArtistFullGenreList(initialSearchKeyword);
}

function getInitialArtistFullGenreList(initialArtist) {
  var urlPrefix = "https://api.spotify.com/v1/search?q="
  $.getJSON(urlPrefix + initialArtist + "&type=artist")
    .done(function (spotifyData) {
      if (spotifyData.artists.items.length === 0) {
        console.log("Unable to find " + initialArtist);
      } else {
        spotifyData.artists.items.forEach(function (artistResult) {
          if (artistResult.name.toLowerCase() === initialArtist) {
            fullGenreList = artistResult.genres;
            autoSuggestionMethod(initialArtist);
            spotifyMethod(initialArtist);
          }
        });
      }
    })
    .fail(function () {
      console.log("Initial request for " + initialArtist + " to the Spotify api failed");
    });
}

function displayResults(resultsArray, limit, methodUsed) {
  if (resultsArray[0] === initialSearchKeyword) {
    resultsArray.shift();
  }
  if (resultsArray.length > limit) {
    console.log("sliced to " + limit);
    resultsArray = resultsArray.slice(0, limit);
  }
  $(".allSearchResults").append('<br><span style="color:#7ca9be;">' + methodUsed + '</span><br>');

  resultsArray.forEach(function (result) {
    $(".allSearchResults").append('<button class="btn-link"><li class="individualResult">' + result + '</li></button>');
  });
  $(".individualResult").click(function () {
    initialSearchInput.value = $(this).html();
    clearDisplayedResults();
    runSearch();
  });
}

function displayTotalNumberOfResults(searchedFor) {
  $(".numberOfResults").html(similarArtistsGoogle.length + similarArtistsSpotify.length + ' similar artists found for <b><span style="color:#7ca9be;">' + searchedFor + '</span></b>');
}

function promptUserToCreateYouTubePlaylist() {
  $(".allSearchResults").append("<br><button class='createPlaylist btn btn-info'>Create this playlist</button>");
  $(".createPlaylist").click(function () {
    $(this).addClass("disabled");
    $(this).html("Now creating your playlist...");
    searchArrayOfArtists(listOfArtistsToQuery);
  });
}

$(".searchBtn").click(function () {
  runSearch();
  this.blur();
});

$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    runSearch();
    this.blur();
  }
});

$("#initialSearchInput").click(function () {
  initialSearchInput.value = "";
  clearDisplayedResults();
});

function clearDisplayedResults() {
  $(".searchedFor").html("");
  $(".allSearchResults").html("");
  $(".numberOfResultsFound").html("");
}

// $(".clearSearchHistoryBtn").click(function () {
//   searchHistory = [];
//   clearDisplayedResults();
//   $(".searchHistory").html("");
//   $(".clearSearchHistoryBtn").hide();
// });

// function displaySearchHistory() {
//   var resultSet = [];
//   var resultSetTotal = 0;
//   for (var k = searchHistory.length - 3; k < searchHistory.length; k++) {
//     resultSet.push(searchHistory[k]);
//     resultSetTotal += searchHistory[k].totalResults;
//   }
//   var searchHistoryBtnClass = resultSet[0].searchKeyword.replace(/\s+/g, "-") + "ResultsBtn";
//   $(".searchHistory").prepend("<li><button class='" + searchHistoryBtnClass + " allSeachHistoryBtn'>" +
//     resultSet[0].searchKeyword + "</button></li>");
//   $("." + searchHistoryBtnClass).append("<span class='resultsCountInSearchHistory'>" + resultSetTotal + "</span>");

//   $("." + searchHistoryBtnClass).click(function () {
//     clearDisplayedResults();
//     initialSearchInput.value = resultSet[0].searchKeyword;
//     $(this).blur();
//     resultSet.forEach(function (result) {
//       $("." + result.conjunction + "Btn").html('"' + result.conjunction + '"<span class="resultsCountInBtn">' +
//         result.totalResults + '</span>');
//       displayTotalNumberOfResults(result);
//       displayResults(result, function () { }); // How best omit this empty anonymous function so as not cause an error in console?
//     });
//   });
//   $(".clearSearchHistoryBtn").show();
// }

// BUG: clicking search after results are already displayed, will duplicate displayed results.

// BUG: Shouldn't be able to search a blank initialSearchKeyord

// BUG: CSS - searchBtn border when highlighted appears to be duplicatedﬁ