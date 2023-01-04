//listed variables and api keys
var apiKey = "BFfpEOBgB8gduVen0dobSrMbxnYQiYUG";
var lat, long;
var longCategoryString = "german , creole-cajun , dutch , banquet rooms , bistro , israeli , slovak , jamaican , vegetarian , seafood , vietnamese , maltese , sichuan , welsh , chinese , japanese , algerian , californian , fusion , shandong , salad bar , savoyan , spanish , ethiopian , taiwanese , doughnuts , iranian , canadian , american , norwegian , french , hunan , polynesian , afghan , roadside , oriental , swiss , erotic , crêperie , surinamese , egyptian , hungarian , nepalese , barbecue , hot pot , hamburgers , mediterranean , latin american , tapas , british , mexican , guangdong , asian (other) , buffet , sushi , mongolian , international , mussels , thai , venezuelan , rumanian , chicken , soup , kosher , steak house , yogurt/juice bar , italian , korean , cypriot , bosnian , bolivian , dominican , belgian , tunisian , scottish , english , pakistani , czech , hawaiian , maghrib , tibetan , arabian , middle eastern , chilean , shanghai , polish , filipino , sudanese , armenian , burmese , brazilian , scandinavian , bulgarian , soul food , colombian , jewish , pizza , sicilian , organic , greek , basque , uruguayan , cafeterias , finnish , african , corsican , syrian , caribbean , dongbei , russian , grill , take away , fast food , australian , irish , pub food , fondue , lebanese , indonesian , danish , provençal , teppanyakki , indian , mauritian , western continental , peruvian , cambodian , snacks , swedish , macrobiotic , ice cream parlor , slavic , turkish , argentinean , austrian , exotic , portuguese , luxembourgian , moroccan , sandwich , cuban"
var categoryString = "Chinese , Japanese , Burgers , Pizza , Indian , Vegetarian , Steak , Seafood , Mexican , Italian"
var categoryID = [7315012, 7315026, 7315069, 7315036, 7315023, 7315050, 7315045, 7315043, 7315033, 7315025, 7315102];
var currentRestaurant = "";

//
var popupOffsets = {
  top: [0, 0],
  bottom: [0, -70],
  'bottom-right': [0, -70],
  'bottom-left': [0, -70],
  left: [25, -35],
  right: [-25, -35]
}

//
var marker;

var categories = categoryString.split(" , ")
var limit = 100;
var selectedCategories = localStorage.getItem("alreadyEaten") || [];
var validRestaurants = [];
var map;

//hides page 2 and 3 on website load
$(function () {
  $("#page2").hide()
  $("#page3").hide()
});

// adds checkboxes to page 2 from categories list
function loadSearchOptions() {
  for (var i = 0; i < categories.length; i++) {
    singleCategoryID = categoryID[i];
    if (selectedCategories.length === 0 || selectedCategories.indexOf(singleCategoryID) !== -1) {
      $('#searchOptions').append(`<li class="foodTiles"><input class="category" type="checkbox" id="${i}" name="cuisine" value="${categories[i]}"><label class="labelText" for="${categories[i]}">${categories[i]}</label></li>`)
    } else {
      $('#searchOptions').append(`<li class="foodTiles"><input class="category" checked type="checkbox" id="${i}" name="cuisine" value="${categories[i]}"><label class="labelText" for="${categories[i]}">${categories[i]}</label></li>`)
    }
  }
}

// deletes all checkboxes
function clearSearchOptions() {
  $('#searchOptions').empty();
}

// removes all checked categories from the selectedCategories list
function submitCategories() {
  selectedCategories = [];

  $('.category:checkbox:not(:checked)').each(function () {
    selectedCategories.push(categoryID[$(this).attr('id')]);
  });

  localStorage.setItem("alreadyEaten", JSON.stringify(selectedCategories));
  console.log(selectedCategories)
}

// calls API to get the nearby restaurants
function getNearbyRestaurants() {
  var categories = selectedCategories.join("%2C");
  var nearbyRestaurants = "https://api.tomtom.com/search/2/nearbySearch/.json?key=" + apiKey + "&lat=" + lat + "&lon=" + long + "&limit=" + limit + "&categorySet=" + categories;
  console.log(nearbyRestaurants)
  fetch(nearbyRestaurants)
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      findOverlap(data.results);
    })
}

//finds restuarants from list of local restaurant that meet the search criteria
function findOverlap(data) {
  validRestaurants = data;

  $("#options").empty();
  if (validRestaurants.length === 0) {

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
    zoom: 13
  });

  var homeCoordinates = [long, lat];

  var element = document.createElement("div")
  element.id = "homeMarker"
  var marker = new tt.Marker({ element: element }).setLngLat(homeCoordinates).addTo(map);

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
    if (marker != undefined) {
      marker.remove();
    }
   
    marker = new tt.Marker().setLngLat(restaurantCoordinates).addTo(map);

    getDirections(restaurantCoordinates, validRestaurants[i].poi.name);

    
     } )
}

function getDirections(restaurantCoordinates, currRestaurant) {

  tt.services.calculateRoute({
    key: '75SvdXNRf0JhAVpoP7d4AWv0kjI96GNa',
    traffic: false,
    locations: long + "," + lat + ":" + restaurantCoordinates[0] + "," + restaurantCoordinates[1]
  })
    .then(function (response) {
      var geojson = response.toGeoJson();
      if (map.getLayer(currentRestaurant) || map.getSource(currentRestaurant)) {
        map.removeLayer(currentRestaurant);
        map.removeSource(currentRestaurant)
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

function convertGeoJson(data) {
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

//clears data and reopens page 1
$("#restart").click(restart);

// onclick for extra info section of detailed info
$("#toggleExtraInfo").click(function () {
  if ($("#toggleExtraInfo").text() === "Show More") {
    $("#toggleExtraInfo").text("Show Less");
    $("#extraInfo").show();
  } else {
    $("#toggleExtraInfo").text("Show More");
    $("#extraInfo").hide();
  }
});

function openPageTwo() {
  $("#page1").hide();
  $("#page2").show();
  loadSearchOptions()
}

function openPageThree() {
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

function restart() {
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
  localStorage.clear("alreadyEaten")
}


function goBack() {
  restart();
  openPageTwo();
}
