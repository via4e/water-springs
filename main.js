import data from './db/springs.json'

let springs = data.data

ymaps.ready(function () {

    var myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 8,
        controls: ['zoomControl']
    });

    // Внешний вид карты
    //myMap.setType('yandex#satellite');

    //Убрать лишние элементы
    $('[class*=copyright]').hide()

    //коллекция
    var myPlacemark = {}
    for(let i=0; i < springs.length; i++) {

        console.log( '***', springs[i] );

        var myPlacemark = new ymaps.Placemark(
            springs[i].coords,
            {
                balloonContent: springs[i].balloonContent,
                iconCaption: springs[i].name
            },
            {
                preset: 'twirl#redIcon'
            });

        myMap.geoObjects.add(myPlacemark);
    }

});