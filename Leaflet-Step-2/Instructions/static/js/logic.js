var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


d3.json(queryUrl, function (earthquakeData) {      
    createMap(earthquakeData);
});


function radiusSize(mag) {
    return mag * 20000;
  };


function radiusColor(mag) {
        return mag > 5 ? '#ff0000' :
               mag > 4 ? '#ff7000' :
               mag > 3 ? '#ffa800' :
               mag > 2 ? '#fff000' :
               mag > 1 ? '#aaffff' :
                         '#55ffff' ; }


function bindPopMaker(feature, layer) {
    layer.bindPopup("<h2> Magnitude : " + feature.properties.mag +
    "</h2><hr><h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
};




function createMap(earthquakeData) {
    
    var earthquakes = L.geoJSON(earthquakeData, {

        pointToLayer: function (feature,latlng) {
            return L.circle(latlng, {
                fillOpacity: 0.4,
                color:" ",
                fillColor: radiusColor(feature.properties.mag),
                radius: radiusSize(feature.properties.mag)
            });
        },
            
        onEachFeature: bindPopMaker
    });



    // Define 3 layers
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"mapbox://styles/mapbox/satellite-streets-v11</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    }); 
    
    var openstreetmap = L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
    });

    var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"mapbox://styles/mapbox/outdoors-v11</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });


    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellitemap,
        "Openstreet":openstreetmap,
        "Outdoors": outdoorsmap,
   
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        
    };


    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [satellitemap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);



    // Add legend
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