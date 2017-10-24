var map;
var markers = [];
var zomatoCall = "https://developers.zomato.com/api/v2.1/search?apikey=774bb0d505fcc3058099aef1068ff9bd&lat=52.474942&lon=-1.8983275&radius=2000&count=20";
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

$.ajax({
    url: zomatoCall,
    async: false,
    dataType: 'json',
    success: function(data){
        restaurants = data['restaurants']
    }
});

function initMap(style) {
    if (style == null) {
        style = daystyles
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.4785217, lng: -1.8902777},
        zoom: 15,
        styles: style
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    map.fitBounds(bounds);

    for (var i = 0; i < restaurants.length; i++) {
        var lat = restaurants[0].restaurant.location.latitude;
        var lng = restaurants[0].restaurant.location.longitude;
        var position = {'lat': lat, 'lng': lng};
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
        bounds.extend(markers[i].position);
    }
}

function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
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

//Checkbox commands
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


function locationItem(title, type, location){
    var self = this;
    self.title = ko.observable(title);
    self.type = ko.observable(type);
    self.location = ko.observable(location);
}

function ViewModel() {
    var self = this;

    self.showlocations = ko.observableArray();

    self.init = function () {
        /*for (i = 0; i < locationStore.length; i++)
        {
            self.showlocations.push(new locationItem
                (
                    locationStore[i].title,
                    locationStore[i].type,
                    locationStore[i].location
                )
            );
        }*/
    };
}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
viewModel.init();