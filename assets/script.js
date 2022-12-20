var apiKey = "BFfpEOBgB8gduVen0dobSrMbxnYQiYUG";
var lat, long;
var longCategoryString = "german , creole-cajun , dutch , banquet rooms , bistro , israeli , slovak , jamaican , vegetarian , seafood , vietnamese , maltese , sichuan , welsh , chinese , japanese , algerian , californian , fusion , shandong , salad bar , savoyan , spanish , ethiopian , taiwanese , doughnuts , iranian , canadian , american , norwegian , french , hunan , polynesian , afghan , roadside , oriental , swiss , erotic , crêperie , surinamese , egyptian , hungarian , nepalese , barbecue , hot pot , hamburgers , mediterranean , latin american , tapas , british , mexican , guangdong , asian (other) , buffet , sushi , mongolian , international , mussels , thai , venezuelan , rumanian , chicken , soup , kosher , steak house , yogurt/juice bar , italian , korean , cypriot , bosnian , bolivian , dominican , belgian , tunisian , scottish , english , pakistani , czech , hawaiian , maghrib , tibetan , arabian , middle eastern , chilean , shanghai , polish , filipino , sudanese , armenian , burmese , brazilian , scandinavian , bulgarian , soul food , colombian , jewish , pizza , sicilian , organic , greek , basque , uruguayan , cafeterias , finnish , african , corsican , syrian , caribbean , dongbei , russian , grill , take away , fast food , australian , irish , pub food , fondue , lebanese , indonesian , danish , provençal , teppanyakki , indian , mauritian , western continental , peruvian , cambodian , snacks , swedish , macrobiotic , ice cream parlor , slavic , turkish , argentinean , austrian , exotic , portuguese , luxembourgian , moroccan , sandwich , cuban"
var categoryString = "german , israeli , jamaican , vegetarian , seafood , vietnamese , sichuan , chinese , japanese  , fusion , salad bar , spanish , ethiopian , taiwanese , doughnuts , iranian , canadian , american , french , afghan , swiss , crêperie , surinamese , egyptian , hungarian , barbecue , hot pot , hamburgers , mediterranean , latin american , tapas , british , mexican , asian (other) , buffet , sushi , mongolian , international , mussels , thai , venezuelan , chicken , soup , kosher , steak house , yogurt/juice bar , italian , korean , bosnian , bolivian , dominican , belgian , tunisian , english , pakistani , czech , hawaiian , tibetan , arabian , middle eastern , chilean , shanghai , polish , filipino , sudanese , armenian , burmese , brazilian  bulgarian , soul food , colombian , jewish , pizza , sicilian , organic , greek , finnish , african , syrian , caribbean , russian , grill , take away , fast food , australian , irish , pub food , fondue , lebanese , indonesian , danish , indian , western continental , peruvian , cambodian , snacks , swedish , ice cream parlor , slavic , turkish , argentinean , austrian , exotic , portuguese , moroccan , sandwich , cuban"
// var apiKeyLinc = "75SvdXNRf0JhAVpoP7d4AWv0kjI96GNa"
// var locations = "52.50931,13.42936:52.50274,13.43872"
var passengerInitCoordinates = [long, lat];
let passengerMarker;
var categories = categoryString.split(" , ")
var limit = 100;
var selectedCategories = [];
var selectedCategoriesIDs = [];
var validRestaurants = [];
const map = tt.map({
  key: '75SvdXNRf0JhAVpoP7d4AWv0kjI96GNa',
  container: 'map',
  center: passengerInitCoordinates,
  zoom: 13
});


getLocation()

function createPassengerMarker(markerCoordinates, popup) {
    const passengerMarkerElement = document.createElement('div');
    passengerMarkerElement.innerHTML = "<img src='img/man-waving-arm_32.png' style='width: 30px; height: 30px';>";
    return new tt.Marker({ element: passengerMarkerElement }).setLngLat(markerCoordinates).setPopup(popup).addTo(map);
}



passengerMarker = createPassengerMarker(passengerInitCoordinates,
  new tt.Popup({ offset: 35 }).setHTML("Click anywhere on the map to change passenger location."));
  
  passengerMarker.togglePopup();

//   function drawPassengerMarkerOnMap(geoResponse) {
//     if (geoResponse && geoResponse.addresses
//         && geoResponse.addresses[0].address.freeformAddress) {
//         passengerMarker.remove();
//         passengerMarker = createPassengerMarker(geoResponse.addresses[0].position,
//             new tt.Popup({ offset: 35 }).setHTML(geoResponse.addresses[0].address.freeformAddress));
//         passengerMarker.togglePopup();
//     }
//   }

//   map.on('click', function (event) {
//     const position = event.lngLat;
//     tt.services.reverseGeocode({
//         key: apiKey,
//         position: position
//     })
//         .then(function (results) {
//             drawPassengerMarkerOnMap(results);
//         });
//   });

//hides page 2 and 3 on website load
$(function () {
  $("#page2").hide()
  $("#page3").hide()
});

// adds checboxes to page 2 from categories list
function loadSearchOptions() {
  for (var value of categories) {
    $('#searchOptions').append(`<li><input class="category" type="checkbox" id="${value}" name="cuisine" value="${value}"><label for="${value}">${value}</label></li>`)
  }
}

// deletes all checkboxes
function clearSearchOptions(){
  $('#searchOptions').empty();
}

// adds all checked categories to selectedCategories list
function submitCategories() {
  $('.category:checkbox:checked').each(function () {
    selectedCategories.push($(this).attr('value'));
  });
  test();
}

// calls API to get the nearby restaurants
function getNearbyRestaurants() {
  var weatherURL = "https://api.tomtom.com/search/2/nearbySearch/.json?key=" + apiKey + "&lat=" + lat + "&lon=" + long + "&categorySet=7315&limit=" + limit;

  fetch(weatherURL)
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      findOverlap(data.results);
      console.log(data);
    })
}


// gets restaurant IDs for selected Restaurants
function test() {
  var weatherURL = "https://api.tomtom.com/search/2/poiCategories.json?key=" + apiKey

  fetch(weatherURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      for(var i = 0; i < data.poiCategories.length; i++){
        if(selectedCategories.includes(data.poiCategories[i].name+ " Restaurant")){
          console.log("here");
          selectedCategoriesIDs.push(data.poiCategories[i].id)
        }
      }
      console.log(selectedCategories)
      console.log(selectedCategoriesIDs)
    })
}

//finds restuarants from list of local restaurant that meet the search criteria
function findOverlap(data) {
  for (var i = 0; i < data.length; i++) {
    var valid = data[i].poi.categories.filter(value => selectedCategories.includes(value));
    if (valid.length > 0) {
      validRestaurants.push(data[i]);
    }
  }
  $("#options").empty();
  $("#loadingInfo").hide();
  $("#selectACard").show();
  addSearchResults()
  console.log(validRestaurants);
}

// asks browser for your current location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

// saves current location to be used in api call
function setPosition(position) {
  lat = position.coords.latitude;
  long = position.coords.longitude;
  passengerInitCoordinates.push(lat)
  passengerInitCoordinates.push(long)
  
  console.log("Latitude: " + lat + "<br>Longitude: " + long);
  console.log(selectedCategories)
  getNearbyRestaurants();
}

// adds search results to search results section on the left of the page
function addSearchResults() {
  for (var i = 0; i < validRestaurants.length; i++) {
    var restaurantName = validRestaurants[i].poi.name;
    var feetAway = Math.round(validRestaurants[i].dist / 3.28084) + " feet away";
    var restaurantLink = validRestaurants[i].poi.url;
    var lat = validRestaurants[i].position.lat;
    var lon = validRestaurants[i].position.lon;
    if (restaurantLink == undefined) {
      restaurantLink = "";
    }
    var card = '<div class="resultCard" data-lat=' + lat + ' data-lon=' + lon + '><h1>' + restaurantName + '</h1><h5>' + feetAway + '</h5><a href="' + restaurantLink + '">' + restaurantLink + '</a></div>'
    $("#options").append(card);

    addOnClickToCards(i)
  }
}

//when a card is clicked, detailed information is added to the map section
function addOnClickToCards(i) {
  $("#options").children().last().get()[0].onclick = (function () {
    $("#detailedInfo").show();
    $("#selectACard").hide();
    $("#selectedRestaurantName").text(validRestaurants[i].poi.name);
    $("#selectedRestaurantAddress").text(validRestaurants[i].address.freeformAddress);
    var restaurantPhone = validRestaurants[i].poi.phone;
    if (restaurantPhone == undefined) {
      restaurantPhone = "";
    }
    $("#selectedRestaurantPhone").text(restaurantPhone);
    var restaurantCategories = validRestaurants[i].poi.categories;
    restaurantCategories = restaurantCategories.filter(function (item) {
      return item !== "restaurant"
    })
    $("#selectedRestaurantCategories").text("Categorie(s): " + restaurantCategories.toString().toUpperCase())
    var latAndLon = "lat: " + validRestaurants[i].position.lat + " long: " + validRestaurants[i].position.lon;
    $("#selectedRestaurantLatAndLon").text(latAndLon)
    var restaurantLink = validRestaurants[i].poi.url;
    if (restaurantLink == undefined) {
      restaurantLink = "";
    }
    $("#selectedRestaurantURL").text(restaurantLink)
    var distance = Math.round(validRestaurants[i].dist / 3.28084) + " feet away";
    $("#selectedRestaurantDistance").text(distance)
  });
}

//hides page 1, and loads page 2 with the checkboxes
$("#startButton").click(function () {
  $("#page1").hide();
  $("#page2").show();
  loadSearchOptions()
});

//hides page 2 and shows page 3
$("#getLocation").click(function () {
  getLocation();
  $("#page2").hide();
  $("#page3").show();
  //add loading search text to page 3
  var loading = '<h5 id="loading"> Loading Search Results... </h5>';
  $("#options").append(loading);
  //shows loading page text for map
  $("#loadingInfo").show();
  //hides select a card for more details text until cards are loaded
  $("#selectACard").hide();
  submitCategories()

});

$("#restart").click(function () {
  //hides page 3 and the detailed info and shows page 1
  $("#page3").hide();
  $("#detailedInfo").hide();
  $("#page1").show();
  //empties search results
  $("#options").empty();
  clearSearchOptions();
  //clears selected categories and restaurants so you can start fresh
  selectedCategories = [];
  validRestaurants = [];
});

// fetchTomTomRoute()
// function fetchTomTomRoute() {
   
//     var queryURL = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?key=${apiKeyLinc}`
//     fetch(queryURL, {
//         method: "GET"
//     })
//     .then(function (response){
//         return response.json();
//     })
//     .then(function (data){
//     console.log(data.routes)
//     })
   
