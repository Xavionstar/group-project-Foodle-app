var apiKey = "BFfpEOBgB8gduVen0dobSrMbxnYQiYUG";
var lat, long;
var longCategoryString = "german , creole-cajun , dutch , banquet rooms , bistro , israeli , slovak , jamaican , vegetarian , seafood , vietnamese , maltese , sichuan , welsh , chinese , japanese , algerian , californian , fusion , shandong , salad bar , savoyan , spanish , ethiopian , taiwanese , doughnuts , iranian , canadian , american , norwegian , french , hunan , polynesian , afghan , roadside , oriental , swiss , erotic , crêperie , surinamese , egyptian , hungarian , nepalese , barbecue , hot pot , hamburgers , mediterranean , latin american , tapas , british , mexican , guangdong , asian (other) , buffet , sushi , mongolian , international , mussels , thai , venezuelan , rumanian , chicken , soup , kosher , steak house , yogurt/juice bar , italian , korean , cypriot , bosnian , bolivian , dominican , belgian , tunisian , scottish , english , pakistani , czech , hawaiian , maghrib , tibetan , arabian , middle eastern , chilean , shanghai , polish , filipino , sudanese , armenian , burmese , brazilian , scandinavian , bulgarian , soul food , colombian , jewish , pizza , sicilian , organic , greek , basque , uruguayan , cafeterias , finnish , african , corsican , syrian , caribbean , dongbei , russian , grill , take away , fast food , australian , irish , pub food , fondue , lebanese , indonesian , danish , provençal , teppanyakki , indian , mauritian , western continental , peruvian , cambodian , snacks , swedish , macrobiotic , ice cream parlor , slavic , turkish , argentinean , austrian , exotic , portuguese , luxembourgian , moroccan , sandwich , cuban"
var categoryString = "german , israeli , jamaican , vegetarian , seafood , vietnamese , sichuan , chinese , japanese  , fusion , salad bar , spanish , ethiopian , taiwanese , doughnuts , iranian , canadian , american , french , afghan , swiss , crêperie , surinamese , egyptian , hungarian , barbecue , hot pot , hamburgers , mediterranean , latin american , tapas , british , mexican , asian (other) , buffet , sushi , mongolian , international , mussels , thai , venezuelan , chicken , soup , kosher , steak house , yogurt/juice bar , italian , korean , bosnian , bolivian , dominican , belgian , tunisian , english , pakistani , czech , hawaiian , tibetan , arabian , middle eastern , chilean , shanghai , polish , filipino , sudanese , armenian , burmese , brazilian  bulgarian , soul food , colombian , jewish , pizza , sicilian , organic , greek , finnish , african , syrian , caribbean , russian , grill , take away , fast food , australian , irish , pub food , fondue , lebanese , indonesian , danish , indian , western continental , peruvian , cambodian , snacks , swedish , ice cream parlor , slavic , turkish , argentinean , austrian , exotic , portuguese , moroccan , sandwich , cuban"
var currentRestaurant = "";
// var apiKeyLinc = "75SvdXNRf0JhAVpoP7d4AWv0kjI96GNa"
// var locations = "52.50931,13.42936:52.50274,13.43872"

var popupOffsets = {
  top: [0, 0],
  bottom: [0, -70],
  'bottom-right': [0, -70],
  'bottom-left': [0, -70],
  left: [25, -35],
  right: [-25, -35]
}

var marker;

var categories = categoryString.split(" , ")
var limit = 100;
var selectedCategories = [];
var validRestaurants = [];
var map;

// function createPassengerMarker(markerCoordinates, popup) {
//   const passengerMarkerElement = document.createElement('div');
//   passengerMarkerElement.innerHTML = "<img src='img/man-waving-arm_32.png' style='width: 30px; height: 30px';>";
//   return new tt.Marker({ element: passengerMarkerElement }).setLngLat(markerCoordinates).setPopup(popup).addTo(map);
// }

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

//finds restuarants from list of local restaurant that meet the search criteria
function findOverlap(data) {
  validRestaurants = data;
  var invalidRestaurants = [];
  for (var i = 0; i < data.length; i++) {
    var valid = data[i].poi.categories.filter(value => selectedCategories.includes(value));
    if (valid.length > 0) {
      invalidRestaurants.push(data[i]);
    }
  }

  //remove restaurants that match an 
  validRestaurants = validRestaurants.filter( function( el ) {
    return invalidRestaurants.indexOf( el ) < 0;
  } );
   
  $("#options").empty();
  if(validRestaurants.length === 0){

    var noResults = '<h5> No Search Results </h5>';
    var goBackButton = '<button id="goBack"> Go Back </button>'
    $("#options").append(noResults);
    $("#options").append(goBackButton);
    $("#goBack").click(goBack);
  } else {
    $("#selectACard").show();
  }
  $("#loadingInfo").hide();
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
  console.log("Latitude: " + lat + "<br>Longitude: " + long);
  console.log(selectedCategories)
  passengerInitCoordinates = [long, lat]

  map = tt.map({
    key: '75SvdXNRf0JhAVpoP7d4AWv0kjI96GNa',
    container: 'map',
    center: passengerInitCoordinates,
    zoom: 14
    });

    var homeCoordinates = [long, lat];
    var marker = new tt.Marker().setLngLat(homeCoordinates).addTo(map);

    // var popup = new tt.Popup({offset: popupOffsets}).setHTML("Home");
    // marker.setPopup(popup).togglePopup();
    
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

    var restaurantCoordinates = [validRestaurants[i].position.lon, validRestaurants[i].position.lat];
    if(marker != undefined){
      marker.remove();
    }
    marker = new tt.Marker().setLngLat(restaurantCoordinates).addTo(map);
   
    getDirections(restaurantCoordinates, validRestaurants[i].poi.name);
    
    
    // var popup = new tt.Popup({offset: popupOffsets}).setHTML(validRestaurants[i].poi.name);
    // marker.setPopup(popup).togglePopup();

  });
}

function getDirections(restaurantCoordinates, currRestaurant){
  
 tt.services.calculateRoute({
  key: '75SvdXNRf0JhAVpoP7d4AWv0kjI96GNa',
  traffic: false,
  locations: long + "," + lat +":" + restaurantCoordinates[0] +"," + restaurantCoordinates[1]
})
  .then(function(response) {
      var geojson = response.toGeoJson();
      if (map.getLayer(currentRestaurant)) {
      map.removeLayer(currentRestaurant);
    }
      currentRestaurant = currRestaurant;
      map.addLayer({
          'id': currentRestaurant,
          'type': 'line',
          'source': {
              'type': 'geojson',
              'data': geojson
          },
          'paint': {
              'line-color': '#4a90e2',
              'line-width': 8
          }
      });
  });
}

function convertGeoJson (data) {
  var geoJson = {
    type: "FeatureCollection",
    features: []
};
for (var i = 0; i < data.routes[0].legs[0].points.length; i++) {
    geoJson.features.push({
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [data.routes[0].legs[0].points[i].longitude, data.routes[0].legs[0].points[i].latitude]
        }
    })
}
return [geoJson];
}

//hides page 1, and loads page 2 with the checkboxes
$("#startButton").click(openPageTwo);

//hides page 2 and shows page 3
$("#getLocation").click(openPageThree);

$("#restart").click(restart);

$("#toggleExtraInfo").click(function () {
  if($("#toggleExtraInfo").text() === "Show More"){
    $("#toggleExtraInfo").text("Show Less");
    $("#extraInfo").show();
  } else {
    $("#toggleExtraInfo").text("Show More");
    $("#extraInfo").hide();
  }
});

function openPageTwo(){
  $("#page1").hide();
  $("#page2").show();
  loadSearchOptions()
}

function openPageThree(){
  getLocation();
  $("#page2").hide();
  $("#page3").show();
  $("#extraInfo").hide();
  //add loading search text to page 3
  var loading = '<h5 id="loading"> Loading Search Results... </h5>';
  $("#options").append(loading);
  //shows loading page text for map
  $("#loadingInfo").show();
  //hides select a card for more details text until cards are loaded
  $("#selectACard").hide();
  submitCategories()

}

function restart () {
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
}


function goBack(){
  restart();
  openPageTwo();
}
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
   
// function setMap(){
//   tt.setProductInfo('Foodle', '1');
//   tt.map({
//       key: '75SvdXNRf0JhAVpoP7d4AWv0kjI96GNa',
//       container: 'map',
//       center: [4.876935, 52.360306],
//   });
// }

// setMap();

