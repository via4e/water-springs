import '../style/style.css';
import config from './config.json';

// check user
let username = '';
try {
    username = localStorage.getItem('username')
} catch (e) {};

if(username) {
    console.log('username', username)
    $('.admin-btn a').text('Админ');
}

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
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

// Create a vector source and layer
const vectorSource = new Vector({
    features: [],
});

const vectorLayer = new VectorLayer({
    source: vectorSource,
});

// Endpoint for springs data
//const endpoint = 'https://patrioty-rodiny.ru:3000/locations';
const endpoint = config.server_domain + ':' + config.server_port + '/' + config.server_locations_path;

// Create a map
// latitude - широта
// longitude - долгота
const russiaCenter = fromLonLat([46.46, 53.53])

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
        zoom: 6,
    }),
});



/**
 * Elements that make up the popup.
 */

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




// Ger springs for map
fetch(endpoint)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data);
        setMapDatas(data)
    })
    .catch(error => {
        // Handle errors
        console.error('Fetch error:', error);
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
