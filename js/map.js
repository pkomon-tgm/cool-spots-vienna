var map = {};

function initMap() {

    let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    });

// found on https://leaflet-extras.github.io/leaflet-providers/preview/

    let esriWorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    let cartoDbPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    let cartoDbVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

// should be most accurate austrian map
    let basemapAtBasemap = L.tileLayer('https://maps{s}.wien.gv.at/basemap/geolandbasemap/{type}/google3857/{z}/{y}/{x}.{format}', {
        maxZoom: 20,
        attribution: 'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
        subdomains: ["", "1", "2", "3", "4"],
        type: 'normal',
        format: 'png',
        bounds: [[46.35877, 8.782379], [49.037872, 17.189532]]
    });

    let basemapAtOrthofoto = L.tileLayer('https://maps{s}.wien.gv.at/basemap/bmaporthofoto30cm/{type}/google3857/{z}/{y}/{x}.{format}', {
        maxZoom: 20,
        attribution: 'Datenquelle: <a href="https://www.basemap.at">basemap.at</a>',
        subdomains: ["", "1", "2", "3", "4"],
        type: 'normal',
        format: 'jpeg',
        bounds: [[46.35877, 8.782379], [49.037872, 17.189532]]
    });

    let baseMaps = {
        "OpenStreetMap": osm,
        "BasemapAT": basemapAtBasemap,
        "BasemapAT Orthofoto": basemapAtOrthofoto,
        "CartoDB Voyager": cartoDbVoyager,
        "CartoDB Positron": cartoDbPositron,
        "ESRI World Topo Map": esriWorldTopoMap,
    };


    let leafletMap = L.map("map_container", {
        center: [48.20849, 16.37208],
        zoom: 12,
        layers: [cartoDbVoyager],
        preferCanvas: true
    });

    let layerControl = L.control
        .layers(baseMaps, {})
        .addTo(leafletMap);

    // expose only needed variables
    map = {}
    map.mapObj = leafletMap;
    map.layerControl = layerControl;

}
