const BADESTELLEN_URL = "/badestellen";
const OEFF_GRUENFLAECHEN_URL = "/gruenflaechen";
const STEHENDE_GEWAESSER_URL = "/stehende_gewaesser";
const FLIESSENDE_GEWAESSER_URL = "/fliessende_gewaesser";
const BAEUME_URL = "/baeume";
const STRASSENBELAGSARTEN_URL = "/strassenbelagsarten";
const MONUMENTALBRUNNEN_URL = "/monumentalbrunnen";
const GRUENGUERTEL_URL = "/gruenguertel";
const TRINKBRUNNEN_URL = "/trinkbrunnen";
const PARKANLAGEN_URL = "/parkanlagen";
const SCHWIMMBAEDER_URL = "/schwimmbaeder";

function getAndMapToPointObjects(url) {
    return d3.json(url)
        .then(data => data.map(PointObject.fromObject));
}

function getAndMapToMultiPolygonObjects(url) {
    return d3.json(url)
        .then(data => data.map(MultiPolygon.fromObject));
}

function mockPointsTree(path) {
    return d3.json(path)
        .then(data => {
            console.log("loaded raw tree data", data);
            const points = data.features.map(feature =>
                new PointObject(Coordinates.fromLonLat(feature.geometry.coordinates),
                    (+feature.properties.BAUMHOEHE)*2));
            return points;
        });
}

function mockPointsDrinkingFountain(path, radius) {
    return d3.json(path)
        .then(data => {
            console.log("loaded raw data", data);
            return data.features.filter(feature => feature.properties.BASIS_TYP !== 2); // filter out fountains for dogs
        })
        .then(features => {
            const points = features.map(feature =>
                new PointObject(Coordinates.fromLonLat(feature.geometry.coordinates),
                    radius));
            return points;
        });
}

function mockPoints(url, radius) {
    return d3.json(url)
        .then(data => {
            console.log("loaded raw data", data);
            const points = data.features.map(feature =>
                new PointObject(Coordinates.fromLonLat(feature.geometry.coordinates),
                    radius));
            return points;
        });
}

function mockMultiPolygons(url) {
    return d3.json(url)
        .then(data => {
            test = data;
            console.log("loaded raw", data);
            return data.features.map(
                feature => {
                    if (feature.geometry.type === "MultiPolygon") {
                        return new MultiPolygon(feature.geometry.coordinates.map(
                            listOfListOfCoords => new Polygon(listOfListOfCoords[0].map(Coordinates.fromLonLat),
                                listOfListOfCoords.slice(1).map(
                                    listOfCoords => listOfCoords.map(Coordinates.fromLonLat)))
                        ));
                    } else if (feature.geometry.type === "Polygon") {
                        return new MultiPolygon([
                            new Polygon(feature.geometry.coordinates[0].map(Coordinates.fromLonLat),
                                feature.geometry.coordinates.slice(1).map(Coordinates.fromLonLat))
                        ]);
                    } else {
                        throw new Error("Mock polygons returned geometry neither of type MultiPolygon nor Polygon");
                    }

                });
        });
}