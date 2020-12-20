//var cf = JSON.parse(config);
//console.log(cf);

// Initialize the platform object:
var platform = new H.service.Platform({
    'apikey': config.api_key
});  

const lat = config.home.lat;
const long = config.home.lng;

console.log(lat);
console.log(long);
// Obtain the default map types from the platform object
var maptypes = platform.createDefaultLayers();

// Instantiate (and display) a map object:
var map = new H.Map(
    document.getElementById('mapContainer'),
    maptypes.vector.normal.map,
    //maptypes.raster.satellite.base,
    {
        zoom: 17.5,
        center: { lat: lat, lng: long }  
    });

var homeMarker = new H.map.Marker({ lat: lat, lng: long });

// Add the marker to the map:
map.addObject(homeMarker);
var mapEvents = new H.mapevents.MapEvents(map);
// Add event listeners:
map.addEventListener('tap', function(evt) {
    // Log 'tap' and 'mouse' events:
    console.log(evt.type, evt.currentPointer.type);
});

// Instantiate the default behavior, providing the mapEvents object:
var behavior = new H.mapevents.Behavior(mapEvents);   

