// M2.5+ Earthquakes geoJSON + Extra URLs
var geojson_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"
var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
var orogens_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_orogens.json"

// Perform a GET
d3.json(geojson_url, function(geojson_data) {
  var features = geojson_data.features
  useFeatures(features)
}); //end GET

function useFeatures(geojson_data) {

  // Create a popup
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3 class = 'info'>" + feature.properties.place + 
      "</h3><hr><h4 class = 'info'>Magnitude: " + feature.properties.mag + "</h4><hr><p>" + new Date(feature.properties.time) + "</p>")
  }; //end onEachFeature

  function markerSize(magnitude) {
    return magnitude * 35000;
  }; //end markerSize

  function markerColor(magnitude) {
    if (magnitude > 5) {
      return "darkred"
    } else if (magnitude > 4.5) {
      return "red"
    } else if (magnitude > 4) {
      return "darkorange"
    } else if (magnitude > 3.5) {
      return "orange"
    } else if (magnitude > 3) {
      return "yellow"
    } else {
      return "lightyellow"
    }
  }; // end markerColor

  var earthquakes = L.geoJSON(geojson_data, {
    pointToLayer: function(geojson_data, latlng) {
      return L.circle(latlng, {
        radius: markerSize(geojson_data.properties.mag),
        color: markerColor(geojson_data.properties.mag),
        fillOpacity: 0.7
      }); // end L.circle
    }, // end pointToLayer
    onEachFeature: onEachFeature
  }) // end earthquakes variable definition

  createMap(earthquakes);
  
}; // end useFeatures

function createMap(earthquakes) {

  var plateMap = new L.LayerGroup();
  var orogensMap = new L.LayerGroup();

  d3.json(plates_url, function(plates) {
    L.geoJSON(plates, {
      style: function() {
        return {
          color: "goldenrod",
          fillOpacity: 0}
      },
      // onEachFeature: onEachFeature
    }).addTo(plateMap)
  });

  d3.json(orogens_url, function(orogens) {
    L.geoJSON(orogens, {
      style: function() {
        return {
          color: "green",
          fillOpacity: 0.2}
      }
    }).addTo(orogensMap)
  });

  var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
  });

  var grayScaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
  });

  var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
  });

  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
  });

  var baseMaps = {
    "Street Map": streetMap,
    "Outdoors Map": outdoorsMap,
    "Light Map": grayScaleMap,
    "Dark Map": darkMap,
    "Satellite Map": satelliteMap
  }; // end baseMaps

  var overlayMaps = {
    Earthquakes: earthquakes,
    Fault_Lines: plateMap,
    Orogens: orogensMap
  }; // end overlayMaps
  // Default mapview and zoom
  var baseMap = L.map("map", {
    center: [
      39.8333333,-98.585522 // center of USA
    ],
    zoom: 4,
    layers: [streetMap, earthquakes]
  });
  // Control panel for map layers
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(baseMap);

  // Legend for map colors
  var legend = L.control(
    {
      position: 'bottomright'
    }
  ); // end legend definition

  legend.onAdd = function() {

    var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [2.5, 3.0, 3.5, 4.0, 4.5, 5],
      labels = [];

    function Color(magnitude) {
      if (magnitude > 5) {
        return "darkred"
      } else if (magnitude > 4.5) {
        return "red"
      } else if (magnitude > 4) {
        return "darkorange"
      } else if (magnitude > 3.5) {
        return "orange"
      } else if (magnitude > 3) {
        return "yellow"
      } else {
        return "lightyellow"
      }
    }; // end Color

    div.innerHTML += "<h5 style='margin:4px'>Magnitudes</h5>"
    
      for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
          "<i style='background:" + Color(magnitudes[i] + 1) + "'></i>  " +
          magnitudes[i] + (magnitudes[i+1] ? '&ndash;' + magnitudes[i+1] + '<br>': '+');
      } // end for-loop
      return div;
  };
  legend.addTo(baseMap);

}; // end createMaps
