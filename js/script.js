//Initiate necessary variables for user session
var map;
var openInfoWindow = "";
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

var restaurants = {};

//Call Zomato API and retrieve top 20 locations around the neighborhood

$.ajax({
    url: zomatoCall,
    dataType: 'json',
    success: function(data){
        restaurants = data.restaurants;
    },
    error: function (jqXHR, exception){
        var msg = "<p> jqXHR: " + jqXHR.responseText + "</p>" +
            "<p> Uncaught exception: " + exception + "</p>";
        $('#errorMsg').html(msg);
    },
    complete: function () {
        var viewModel = new ViewModel();
        ko.applyBindings(viewModel);
        viewModel.init();
        initMap();
    }
});

// Create a model structure for the Knockout ViewModel
// to follow when creating items based on the API Call results.

function locationItem(name, cuisines, address, latitude, longitude){
    var self = this;
    self.name = ko.observable(name);
    self.cuisines= ko.observable(cuisines);
    self.address = ko.observable(address);
    self.location = ko.observable(latitude);
    self.location = ko.observable(longitude);
}

function ViewModel() {
    // Set self variable to reference ViewModel "this" Scope
    var self = this;
    self.selectedValue = ko.observable();

    // showlocations array is will be the array that the list of items on the page will rely on.
    // All other changes to the arrays will dump final results here for user to interface with
    self.showlocations = ko.observableArray();



    // allLocations is a list of ALL locations, will be used as a default list for reference
    self.allLocations = ko.observableArray();

    // On init, load the location values in allLocations and then set the showlocations to
    // be equivalent to it.
    self.init = function ()
    {
        for (var i = 0; i < restaurants.length; i++) {

            self.allLocations.push(
                new locationItem(
                    restaurants[i].restaurant.name,
                    restaurants[i].restaurant.cuisines,
                    restaurants[i].restaurant.location.address,
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
        self.allLocations().forEach(function(v,i)
        {
            var name = v.name();
            var cuisines = v.cuisines();
            var searchName = name.toLowerCase().search(params.toLowerCase());
            var searchCuisines = cuisines.toLowerCase().search(params.toLowerCase());
            if (searchName > -1 || searchCuisines > -1)
            {
                tempLocations.push(v);
            }
        });
        markers.forEach(function (v, i) {
                v.setVisible(false);
        });

        tempLocations().forEach(function (v, i) {
            var thisLocationName = v.name();
            markers.forEach(function (v, i) {
                if (v.title === thisLocationName)
                {
                    v.setVisible(true);
                }
            });
        });
        self.showlocations(tempLocations());
    };

    // This function focuses the map on the marker relative to the restaurant
    // chosen in the desktop view.
    self.selectLocation = function (param) {
        if(openInfoWindow !== "")
        {
            openInfoWindow.close();
        }
        markers.forEach(function (v, i) {
            if (v.title === param.name())
            {
                v.setAnimation(google.maps.Animation.BOUNCE);
                populateInfoWindow(v, new google.maps.InfoWindow());
            }
            else{
                v.setAnimation(null);
            }
        });
    };

    // This function focuses the map on the marker relative to the restaurant
    // chosen in the mobile view
    self.changeLocation = function(param){
        if(openInfoWindow !== "")
        {
            openInfoWindow.close();
        }
        markers.forEach(function (v, i) {
            if (v.title === param.selectedValue().name())
            {
                v.setAnimation(google.maps.Animation.BOUNCE);
                populateInfoWindow(v, new google.maps.InfoWindow());
            }
            else{
                v.setAnimation(null);
            }
        });
    };
}

// Initiate Map Render at specified location, according to coordinates
// Set map style to day time style by default
// Get coordinates of all locations in JSON data,
// and create array of markers that need to be rendered.

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.4771526, lng: -1.8907827},
        zoom: 15,
        styles: daystyles
    });
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(52.4411273,-1.9444738),
        new google.maps.LatLng(52.4942329,-1.8864697)
    );
    map.fitBounds(bounds);
    function makeMarkerIcon(markerColor)
    {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    }
    // Style the markers a bit. This will be our listing marker icon.
    // var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    // var highlightedIcon = makeMarkerIcon('FFFF24');
    var defaultIcon = makeMarkerIcon('ffff1a');
    var highlightedIcon = makeMarkerIcon('99ff33');

    var setMarker = function(index){
        var lat = restaurants[index].restaurant.location.latitude;
        var lng = restaurants[index].restaurant.location.longitude;
        var position = {lat: parseFloat(lat), lng: parseFloat(lng)};
        var title = restaurants[index].restaurant.name;
        var zomatoId = restaurants[index].restaurant.id;
        var cuisine = restaurants[index].restaurant.cuisines;
        var menu_url = restaurants[index].restaurant.menu_url;
        var thumb_url = restaurants[index].restaurant.thumb;

        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            cuisine: cuisine,
            menu_url: menu_url,
            thumb_url: thumb_url,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: index
        });
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
        markers.push(marker);
    };

    for (var i = 0; i < restaurants.length; i++) {
        setMarker(i);
    }
}

function mapError(e){
    $('#mapError').html("Error loading MAP API");
}

// Check to make sure to populate the infoWindow.
function populateInfoWindow(marker, infowindow) {
    openInfoWindow = infowindow;
    if (openInfoWindow.marker !== marker) {
        openInfoWindow.marker = marker;
        openInfoWindow.setContent
        (
            '<div class="container" style="max-width: 400px;">' +
            '<div class="row">' +
            '<div class="col-xs-6"><img width="128px;" src="' + marker.thumb_url + '"/></div>' +
            '<div class="col-xs-6">' +
            '<h3>' + marker.title + '</h3>' +
            '<p>' + marker.cuisine + ' Restaurant </p>' +
            '<p><a href=" '+ marker.menu_url +'">See Menu</a></p>' +
            '</div></div></div>'
        );

        openInfoWindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        openInfoWindow.addListener('closeclick', function () {
            openInfoWindow.setMarker = null;
            marker.setAnimation(null);
        });
    }
}
