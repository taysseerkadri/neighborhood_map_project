//Initiate necessary variables for user session
var map;
var markers = [];
var zomatoCall = "https://developers.zomato.com/api/v2.1/search?apikey=774bb0d505fcc3058099aef1068ff9bd&lat=52.4771526&lon=-1.8907827&radius=1000&count=20";
var daystyles = [
    {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
            { color: '#ffffff' },
            { weight: 6 }
        ]
    },{
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
            { color: '#006600' }
        ]
    },{
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [
            { visibility: 'on' },
            { color: '#d9d9d9' }
        ]
    },{
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
            { visibility: 'on' },
            { color: '#ffcc80' }
        ]
    },{
        featureType: 'water',
        stylers:[
            { color: '#19a0d8' }
        ]
    },{
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
            { lightness: 100 }
        ]
    },{
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
            { lightness: -100 }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            { color: '#efe9e4' },
            { lightness: -40 }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
            { color: '#efe9e4' },
            { lightness: -25 }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [
            { visibility: 'off' }
        ]
    },{
        featureType: 'transit.station',
        stylers: [
            { weight: 9 },
            { hue: '#006600' }
        ]
    }
];
var nightstyles = [
    {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
            { color: '#66ff33' },
            { weight: 6 }
        ]
    },{
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
            { color: '#000000' }
        ]
    },{
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [
            { visibility: 'on' },
            { color: '#000033' }
        ]
    },{
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
            { visibility: 'on' },
            { color: '#660000' }
        ]
    },{
        featureType: 'water',
        stylers: [
            { color: '#19a0d8' }
        ]
    },{
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
            { lightness: 100 }
        ]
    },{
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
            { lightness: -100 }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            { color: '#9D00FF' }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
            { color: '#efe9e4' },
            { lightness: -25 }
        ]
    },{
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [
            { visibility: 'off' }
        ]
    },{
        featureType: 'transit.station',
        stylers: [
            { weight: 4 },
            { hue: '#ffffff' }
        ]
    }
];
var restaurants = {};


//Call Zomato API and retrieve top 20 locations around the neighborhood
$.ajax({
    url: zomatoCall,
    async: false,
    dataType: 'json',
    success: function(data){
        restaurants = data['restaurants']
    }
});

// Create a model structure for the Knockout ViewModel
// to follow when creating items based on the API Call results.

function locationItem(name, cuisines, address, afterhours, latitude, longitude){
    var self = this;
    self.name = ko.observable(name);
    self.cuisines= ko.observable(cuisines);
    self.address = ko.observable(address);
    self.afterhours = ko.observable(afterhours);
    self.location = ko.observable(latitude);
    self.location = ko.observable(longitude);
}

function ViewModel() {
    // Set self variable to reference ViewModel "this" Scope
    var self = this;

    // showlocations array is will be the array that the list of items on the page will rely on.
    // All other changes to the arrays will dump final results here for user to interface with
    self.showlocations = ko.observableArray();

    // allLocations is a list of ALL locations, will be used as a default list for reference
    self.allLocations = ko.observableArray();

    // On init, load the location values in allLocations and then set the showlocations to
    // be equivalent to it.
    self.init = function () {
        for (var i = 0; i < restaurants.length; i++) {

            // THE API DOES NOT INCLUDE AFTER HOURS INFO.
            // WE INCLUDE IT HERE ARTIFICIALLY
            // FOR THE PURPOSES OF THIS PROJECT.

            var afterhours = false;
            if(i % 2 == 0) {
                afterhours = true;
            }
            self.allLocations.push(
                new locationItem(

                    restaurants[i].restaurant.name,
                    restaurants[i].restaurant.cuisines,
                    restaurants[i].restaurant.location["address"],
                    afterhours,
                    restaurants[i].restaurant.location.latitude,
                    restaurants[i].restaurant.location.longitude
                )
            );
        }
        self.showlocations(self.allLocations());
    };

    // filterResults is a function that gets the value of the search query,
    // and builds a temporary array with the search query affecting the results.
    // The final results are then loaded into the showlocations array.
    // this function is called on every keyup event.

    self.filterResults = function(data, event){
        var tempLocations = ko.observableArray();
        var params = event.target.value;
        self.allLocations().forEach(function(v,i){
            var name = v.name();
            var search = name.toLowerCase().search(params.toLowerCase());
            if (search > -1){
                tempLocations.push(v);
            }
        });
        self.showlocations(tempLocations());
    };

    // This function focuses the map on the marker relative to the restaurant
    // chosen.
    self.selectLocation = function (param) {
        console.log(param);
    };
}

// Initiate Map Render at specified location, according to coordinates
// Set map style to day time style by default
// Get coordinates of all locations in JSON data,
// and create array of markers that need to be rendered.

function initMap(style) {
    if (style == null) {
        style = daystyles
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.4771526, lng: -1.8907827},
        zoom: 15,
        styles: style
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(52.4411273,-1.9444738),
        new google.maps.LatLng(52.4942329,-1.8864697)

    );
    map.fitBounds(bounds);

    for (var i = 0; i < restaurants.length; i++) {
        var lat = restaurants[i].restaurant.location.latitude;
        var lng = restaurants[i].restaurant.location.longitude;
        var position = {lat: parseFloat(lat), lng: parseFloat(lng)};
        var title = restaurants[i].restaurant.name;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        //bounds.extend(markers[i].position);
    }
}


// Check to make sure to populate the infoWindow.
function populateInfoWindow(marker, infowindow) {

    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.setMarker = null;
        });
    }
}

//Checkbox commands, changes style color of map
$("#afterhours").change(function () {
    if($(this).is(":checked"))
    {
        initMap(nightstyles);
    }
    else
    {
        initMap(daystyles);
    }
});




var viewModel = new ViewModel();
ko.applyBindings(viewModel);
viewModel.init();
//console.log(restaurants);