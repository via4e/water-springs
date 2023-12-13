import '../style/style.css';
import data from '../db/springs.json'
let springs = data.data

// latitude - широта
// longitude - долгота
const russiaCenter = fromLonLat([94.15, 66.25])

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


// Create a map
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

// Loop through JSON data and add features to the vector source
springs.forEach(point => {
    const longitude = point.coords[1];
    const latitude = point.coords[0];

    const feature = new Feature({
        geometry: new Point(fromLonLat([longitude, latitude])),
        name: point.name,
    });

    // Set the marker style to a red circle
    feature.setStyle(new Style({
        image: new Circle({
            radius: 7,
            fill: new Fill({
                color: 'red',
            }),
            stroke: new Stroke({
                color: 'black',
                width: 2,
            }),
        }),
    }));

    vectorSource.addFeature(feature);
});



// Create a popup overlay
const popup = new Overlay({
    element: document.getElementById('popup'),
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});

map.addOverlay(popup);

// Display popup on click
map.on('click', function (event) {
    const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
        return feature;
    });

    if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        popup.setPosition(coordinates);
        const content = document.getElementById('popup-content');
        content.innerHTML = `<div>${feature.get('name')}</div>`;
    } else {
        popup.setPosition(undefined);
    }
});