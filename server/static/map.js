// Initialization stuff
var platform = new H.service.Platform({
    'apikey': config.api_key
});  

// Home variables
const lat = config.home.lat;
const long = config.home.lng;
const updateDelay = 5000;
var homePt = {"lat": lat, "lng": long + 0.0001};

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
    lastLocationMarker.setData('<h4>Last Known Location</h4>' +
        `<p>Lat: ${lastPtLat}, Long: ${lastPtLng}</p>` +
        `<a href="https://google.com/maps/place/${lastPtLat},${lastPtLng}" ` +
        'target="_blank">View in Google Maps</a>');
    // Move the info bubble and update it as the marker moves
    try {
        if (lastLocInfoBubble.getState() == 'open') {
            lastLocInfoBubble.setPosition(lastLocationMarker.getGeometry());
            lastLocInfoBubble.setContent(lastLocationMarker.getData());
        }
    } catch (err) {}
}

/* Populate the map with existing data including
 * home marker and gps path
 */
function populateMap() {
    createMarkers();
    // Point data is stored in data.json
    fetch('data/data.json')
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

function createMarkers() {
    lastLocInfoBubble = null;
    // Create markers group
    markers = new H.map.Group();
    map.addObject(markers);
    // Add home marker to the map
    homeMarker = new H.map.Marker({ lat: lat, lng: long });
    homeMarker.setData(`<h4>Home</h4><p>Lat: ${lat}, Long: ${long}</p>`);
    markers.addObject(homeMarker);
    // Add last location marker to the map
    lastLocationMarker = new H.map.Marker({lat: lat, lng: long});
    markers.addObject(lastLocationMarker);
    // Show info bubble when a marker is clicked
    markers.addEventListener('tap', function(evt) {
        // Close other info bubbles so the screen is not cluttered
        ui.getBubbles().forEach(function(bub) {
            bub.close();
        });
        // Add the bubble for the marker that was clicked
        var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
            content: evt.target.getData()
        });
        // Used in updateMap() to change location of bubble w/ marker
        if (evt.target.getId() == lastLocationMarker.getId()) 
            lastLocInfoBubble = bubble;
        ui.addBubble(bubble);
    }, false);
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
    // Default UI / controls
    ui = H.ui.UI.createDefault(map, maptypes);
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
