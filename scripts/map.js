import '../style/style.css';
import data from '../db/springs.json'
let springs = data.data


import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { OSM, Vector } from 'ol/source';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';  // Add this line
import Fill from 'ol/style/Fill';

// Create a vector source and layer
const vectorSource = new Vector({
    features: [],
});

const vectorLayer = new VectorLayer({
    source: vectorSource,
});

// Endpoint for springs data
const endpoint = 'https://localhost:10443/locations';

// Create a map
// latitude - широта
// longitude - долгота
const russiaCenter = fromLonLat([94.15, 66.25])

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        vectorLayer,
    ],
    view: new View({
        center: russiaCenter,
        zoom: 4.5,
    }),
});



// Make a GET request to the specified endpoint
fetch(endpoint)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Handle the data received from the server
        console.log('Data received:', data);
        setMapDatas(data)
    })
    .catch(error => {
        // Handle errors
        console.error('Fetch error:', error);
    });

const popup = new Overlay({
    element: document.getElementById('popup'),
    autoPan: false,
});

map.addOverlay(popup);

map.on('singleclick', function (evt) {
    var prettyCoord = ol.coordinate.toStringHDMS(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
    popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
});

function setMapDatas (springs) {

    if (!springs.length) return;
    springs.forEach(point => {
        const longitude = Number(point.longitude);
        const latitude  = Number(point.latitude);

        const feature = new Feature({
            geometry: new Point(fromLonLat([longitude, latitude])),
            name: point.name,
        });

        // Set the marker style to a red circle
        feature.setStyle(new Style({
            image: new Circle({
                radius: 9,
                fill: new Fill({
                    color: 'blue',
                }),
                stroke: new Stroke({
                    color: 'orange',
                    width: 2,
                }),
            }),
        }));

        vectorSource.addFeature(feature);
    });
}
