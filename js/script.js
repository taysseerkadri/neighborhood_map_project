var map;
var markers = [];
var locationStore = [
        {title: 'Birmingham Snow Hill', type: 'transit', location: {lat: 52.4767669, lng: -1.8962941}},
        {title: 'Birmingham Moor Street', type: 'transit', location: {lat: 52.4776389, lng: -1.8960543}},
        {title: 'Birmingham New Street Station', type: 'transit', location: {lat: 52.4776945, lng: -1.9012386}},

        {title: 'Ming Moon Chinese Restaurant & Karaoke Bar', type: 'food', location: {lat: 52.4776711, lng: -1.8989897}},
        {title: 'Jimmy Spices', type: 'food', location: {lat: 52.4763413, lng: -1.9073256}},
        {title: 'Deep Caribbean Experience', type: 'food', location: {lat: 52.4730713, lng: -1.903475}},

        {title: 'Radisson Blu Hotel, Birmingham', type: 'hotel', location: {lat: 52.4741191, lng: -1.8982193}},
        {title: 'Ibis Birmingham New Street Station Hotel', type: 'hotel', location: {lat: 52.4741191, lng: -1.8982193}},
        {title: 'Macdonald Burlington Hotel', type: 'hotel', location: {lat: 52.4766476, lng: -1.8989146}},

        {title: 'Argos', type: 'shopping', location: {lat: 52.4766476, lng: -1.8989146}},
        {title: 'John Lewis', type: 'shopping', location: {lat: 52.4766476, lng: -1.8989146}},
        {title: 'Mailbox Birmingham', type: 'shopping', location: {lat: 52.4752309, lng: -1.9033766}},

        {title: 'O2 Academy Birmingham', type: 'entertainment', location: {lat: 52.4752309, lng: -1.9033766}},
        {title: 'The Glee Club', type: 'entertainment', location: {lat: 52.4752309, lng: -1.9033766}},
        {title: 'Symphony Hall', type: 'entertainment', location: {lat: 52.4771366, lng: -1.9063213}},

        {title: 'Genting Casino Chinatown Birmingham', type: 'nightlife', location: {lat: 52.4746765, lng: -1.9006145}},
        {title: 'Boltz Club', type: 'nightlife', location: {lat: 52.4747277, lng: -1.9006566}},
        {title: 'NUTS LIVEPOKER Limited', type: 'nightlife', location: {lat: 52.4908262, lng: 1.9108382}}
    ];
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

function initMap(style) {
    if (style == null)
    {
        style = daystyles
    }
    map = new google.maps.Map(document.getElementById('map'),{
        center: { lat: 52.4785217, lng: -1.8902777 },
        zoom: 15,
        styles: style
    });
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



function listLocationsModel() {
    var self = this;

    self.locations = ko.observableArray([]);
    for (i=0; i< locationStore.length; i++)
    {
            self.locations.push(locationStore[i]);
    }


};

ko.applyBindings (new listLocationsModel());