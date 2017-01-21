//(function () {
"use strict";

var initialArtistGenres = [];
var listOfArtistsToQuery = [];

function determineInitialArtistGenres(keyword) {
  $.getJSON("https://api.spotify.com/v1/search?q=" + keyword + "&type=artist", function (spotifyData) {
    if (spotifyData.artists.items.length > 0) {
      for (var i = 0; i < spotifyData.artists.items.length; i++) {
        var returnedArtistName = spotifyData.artists.items[i].name.toLowerCase();
        if (returnedArtistName === keyword) {
          initialArtistGenres = spotifyData.artists.items[i].genres;
          break;
        }
      }
    }
  });
}


$("#initialSearchInput").keydown(function (key) {
  if (key.keyCode === 13) {
    ["vs", "and", "with"].forEach(function (conjunction) {
      runSearch(conjunction);
    });
    $(this).blur();
    $(".subheading").slideUp("slow");
  }
});

$(".searchBtn").click(function () {
  ["vs", "and", "with"].forEach(function (conjunction) {
    runSearch(conjunction);
  });
  $(this).blur();
  $(".subheading").slideUp("slow");
});

var searchHistory = [];
var conjunctionSearchCount = 0;
function runSearch(conjunction) {
  var initialSearchKeyword = initialSearchInput.value.toLowerCase();
  determineInitialArtistGenres(initialSearchKeyword);
  suggestQueries(initialSearchKeyword, 0);

  var resultsArray = [initialSearchKeyword];
  var apiDataIndexCount = 0;

  function suggestQueries(searchKeyword, apiDataIndex) {
    var apiURL = "https://suggestqueries.google.com/complete/search?client=firefox&callback=?&q=";
    $.getJSON(apiURL + searchKeyword + " " + conjunction, function (apiData) {
      var returnedResult = validateResult(apiData[1][apiDataIndex]);
      resultsArray.push(returnedResult);
      console.log(returnedResult);

      if (resultsArray.find(duplicateCheck) === undefined) {
        suggestQueries(returnedResult, 0);
      } else {
        removeDuplicateAndLogPosition();
        if (apiDataIndexCount < apiData[1].length) {
          apiDataIndexCount++;
          suggestQueries(initialSearchKeyword, apiDataIndexCount);
        } else {
          conjunctionSearchCount++
          if (conjunctionSearchCount % 3 === 0) {
            displayResults();
            displayTotalNumberOfResults(initialSearchKeyword);
            //displaySearchHistory();
            if (listOfArtistsToQuery.length > 0) {
              promptUserToCreateYouTubePlaylist();
            }
          }
        }
      }
    });
  }

  function validateResult(result) {
    result += ""; // Result must be a string for indexOf to work
    var conjunctionPosition = result.indexOf(" " + conjunction + " ");
    if (conjunctionPosition !== -1) {
      result = result.slice(conjunctionPosition + conjunction.length + 2, result.length);
      validateAsArtist(result);
      return result;
    } else {
      return initialSearchKeyword; // Creates condition, which starts a new search
    }
  }

  function validateAsArtist(keyword) {
    $.getJSON("https://api.spotify.com/v1/search?q=" + keyword + "&type=artist", function (spotifyData) {
      if (initialArtistGenres.length > 0 && spotifyData.artists.items.length > 0) {
        spotifyData.artists.items.forEach(function (spotifyArtistResult) {
          var returnedArtistName = spotifyArtistResult.name.toLowerCase();
          var artistPopularity = spotifyArtistResult.popularity;
          if (returnedArtistName === keyword && artistPopularity > 1) {
            var currentArtistGenres = spotifyArtistResult.genres;
            var commonGeneres = initialArtistGenres.filter(function (val) {
              return currentArtistGenres.indexOf(val) !== -1;
            });
            if (commonGeneres.length > 0) {
              if (listOfArtistsToQuery.indexOf(keyword) === -1 && keyword !== initialSearchKeyword) {
                listOfArtistsToQuery.push(keyword);
               // console.log(keyword + " looks to be a similar artist! Common generes: " + commonGeneres);
              }
            }
          }
        });
      }
    });
  }


  function duplicateCheck(val, pos) {
    return resultsArray.indexOf(val) !== pos;
  }

  function removeDuplicateAndLogPosition() {
    resultsArray.pop();
  }

  function CreateResultObject() {
    this.searchKeyword = initialSearchKeyword;
    this.conjunction = conjunction;
    this.results = listOfArtistsToQuery;
    this.totalResults = resultsArray.length - 1;
  }
} // end of runSearch()

function displayTotalNumberOfResults(searchedFor) {
  $(".allSearchResults").prepend('<li class="numberOfResultsFound">' +
    listOfArtistsToQuery.length + ' results found for <b></span> <span style="color:#7ca9be;">' + searchedFor + '</span></b></li>');
}

function displayResults() {
  $(".allSearchResults").append("<h3><i>From " + listOfArtistsToQuery[0] + " to " + listOfArtistsToQuery[listOfArtistsToQuery.length-1] + "</i></h3><br>");
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
    $(this).blur();
    searchArrayOfArtists(listOfArtistsToQuery);
  });
}


function clearDisplayedResults() {
  initialSearchInput.value = "";
  $(".allSearchResults").html("");
  $(".numberOfResultsFound").html("");
}

$(".clearSearchHistoryBtn").click(function () {
  searchHistory = [];
  clearDisplayedResults();
  $(".searchHistory").html("");
  $(".clearSearchHistoryBtn").hide();
});



$("#initialSearchInput").click(function () {
  clearDisplayedResults();
  listOfArtistsToQuery = [];
  $(".allConjunctionBtns").css("visibility", "hidden");
});

//})();

// BUG: clicking search after results are already displayed, will duplicate displayed results.

// BUG: Shouldn't be able to search a blank initialSearchKeyord

// BUG: CSS - searchBtn border when highlighted appears to be duplicatedﬁ