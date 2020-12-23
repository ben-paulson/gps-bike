// Initialization stuff
var platform = new H.service.Platform({
    'apikey': config.api_key
});  

// Home variables
const lat = config.home.lat;
const long = config.home.lng;
const updateDelay = 5000;
var homePt = {"lat": lat, "lng": long};

/* Parses a list of point objects and adds them
 * to the linestring
 */
function parsePoints(points) { 
    points.forEach(function(point) {
        var coords = Object.values(point)[0];
        var time = Object.keys(point)[0]; // For later use
        // Format the coordinates correctly for the linestring
        var ptData = {"lat": coords[0], "lng": coords[1]};
        linestring.pushPoint(ptData);
    });
}

/* Update the map by performing a GET request to
 * /gpsupdate which will return a list of new points
 * to be added to the map
 */
function updateMap() {
    $.get("/gpsupdate", function(data) {
        var points = data.new_points;
        parsePoints(points, linestring);
        markLastLocation();
        polyline.setGeometry(linestring);
    })
}

/* Gets the position of the last recorded location
 * of the GPS on the map and moves the marker to
 * that location
 */
function markLastLocation() {
    var points = linestring.getLatLngAltArray();
    var lastPtLat = points[points.length - 3];
    var lastPtLng = points[points.length - 2];
    lastLocationMarker.setGeometry({"lat": lastPtLat, "lng": lastPtLng});
}

/* Populate the map with existing data including
 * home marker and gps path
 */
function populateMap() {
    // Add home marker to the map
    homeMarker = new H.map.Marker({ lat: lat, lng: long });
    map.addObject(homeMarker);
    // Add last location marker to the map
    lastLocationMarker = new H.map.Marker({lat: lat, lng: long});
    map.addObject(lastLocationMarker);
    // Point data is stored in data.json
    fetch('static/data.json')
        .then(response => response.json())
        .then(function(data) {
            // Get all the previous points
            var points = data.points;
            linestring = new H.geo.LineString();
            /* Avoid errors if no data has been collected.
               Polyline requires at least 2 points. */
            if (points.length < 2) {
                linestring.pushPoint(homePt);
                linestring.pushPoint(homePt);
            }
            // Add each point to the linestring
            parsePoints(points);
            markLastLocation();
            polyline = new H.map.Polyline(linestring, {style: {lineWidth: 10}});
            map.addObject(polyline);
        })
}

/* Create the default map with default map behavior
 */
function createMap() {
    var maptypes = platform.createDefaultLayers();
    map = new H.Map(
        document.getElementById('mapContainer'),
        maptypes.vector.normal.map,
        //maptypes.raster.satellite.base,
        {
            zoom: 17.5,
            center: homePt  
        });
    var mapEvents = new H.mapevents.MapEvents(map);
    // Default map behavior (zoom, scroll, etc.)
    var behavior = new H.mapevents.Behavior(mapEvents);       
}

function start() {
    createMap();
    populateMap();
    // Update the map every 5000ms
    var intervalID = setInterval(updateMap, updateDelay);
}

start();
