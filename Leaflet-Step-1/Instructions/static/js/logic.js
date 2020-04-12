//declare url
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//create a function to drwa the map
d3.json(queryUrl, function (earthquakeData) {      
    createMap(earthquakeData);
});

//create a function to resize the circle by mag
function radiusSize(mag) {
    return mag * 20000;
  };

//create a function to color the circle by mag
function radiusColor(mag) {
    return mag > 5 ? '#ff0000' :
           mag > 4 ? '#ff7000' :
           mag > 3 ? '#ffa800' :
           mag > 2 ? '#fff000' :
           mag > 1 ? '#aaffff' :
                     '#55ffff' ; }

//create a function to bindpop the data with mag value, earthquake place and time
function bindPopMaker(feature, layer) {
    layer.bindPopup("<h2> Magnitude : " + feature.properties.mag +
    "</h2><hr><h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
};



// create map function
function createMap(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {

        pointToLayer: function (feature,latlng) {
            return L.circle(latlng, {
                fillOpacity: 0.85,
                color:"green",
                fillColor: radiusColor(feature.properties.mag),
                radius: radiusSize(feature.properties.mag)
            });
        },
            
        onEachFeature: bindPopMaker
    });


    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);



    // create legend
    var legend = L.control({position:'bottomright'});

    legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5],
        labels = [`<strong>Magnitude Grade</strong>`];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + radiusColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;};
    legend.addTo(myMap);
}