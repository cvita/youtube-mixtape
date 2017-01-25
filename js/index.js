"use strict";
// Testing to see if this version makes it into the "applying js promises" branch
var initialSearchKeyword;
var fullGenreList;
var similarArtists = [];

function runSearch() {
  initialSearchKeyword = document.getElementById("initialSearchInput").value;
  initialSearchKeyword = initialSearchKeyword.toLowerCase();
  console.log("artist: " + initialSearchKeyword);
  getInitialArtistFullGenreList(initialSearchKeyword, function () {
    autoSuggestionMethod(initialSearchKeyword);
    spotifyMethod(initialSearchKeyword);
  });
}

function getInitialArtistFullGenreList(initialArtist, callback) {
  fullGenreList = [];
  var urlPrefix = "https://api.spotify.com/v1/search?q="
  $.getJSON(urlPrefix + initialArtist + "&type=artist", function (spotifyData) {
    if (spotifyData.artists.items.length > 0) { // Need to address case for no results
      for (var i = 0; i < spotifyData.artists.items.length; i++) {
        var returnedArtistName = spotifyData.artists.items[i].name.toLowerCase();
        if (returnedArtistName === initialArtist) {
          fullGenreList = spotifyData.artists.items[i].genres;
        }
      }
    }
  });
  setTimeout(callback, 800);
}


function displayTotalNumberOfResults(searchedFor) {
  $(".allSearchResults").prepend('<li class="numberOfResultsFound">' +
    listOfArtistsToQuery.length + ' results found for <b></span> <span style="color:#7ca9be;">' + searchedFor + '</span></b></li>');
}

function displayResults() {
  $(".allSearchResults").append("<h3><i>From " + listOfArtistsToQuery[0] + " to " + listOfArtistsToQuery[listOfArtistsToQuery.length - 1] + "</i></h3><br>");
  for (var j = 0; j < listOfArtistsToQuery.length; j++) {
    var googleSearchLink = "https://www.google.com/search?q=musical%20artist:%20" + listOfArtistsToQuery[j];
    $(".allSearchResults").append("<a href='" + googleSearchLink + "'target='_blank'>" +
      "<li class='individualResult'>" + listOfArtistsToQuery[j] + "</li></a>");
  }
}

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

function promptUserToCreateYouTubePlaylist() {
  $(".allSearchResults").append("<br><button class='createPlaylist btn btn-info'>Create this playlist</button>");
  $(".createPlaylist").click(function () {
    $(this).addClass("disabled");
    $(this).html("Now creating your playlist...");
    searchArrayOfArtists(listOfArtistsToQuery);
  });
}

function clearDisplayedResults() {
  initialSearchInput.value = "";
  $(".allSearchResults").html("");
  $(".numberOfResultsFound").html("");
  similarArtists = [];
  similarArtistsGoogle = [];
}

$(".searchBtn").click(function () {
  runSearch();

});

$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    runSearch();
  }
});

$("#initialSearchInput").click(function () {
  clearDisplayedResults();
});

// $(".clearSearchHistoryBtn").click(function () {
//   searchHistory = [];
//   clearDisplayedResults();
//   $(".searchHistory").html("");
//   $(".clearSearchHistoryBtn").hide();
// });






// BUG: clicking search after results are already displayed, will duplicate displayed results.

// BUG: Shouldn't be able to search a blank initialSearchKeyord

// BUG: CSS - searchBtn border when highlighted appears to be duplicatedﬁ