
class Coordinates {
    constructor(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }

    static fromLatLon([lat, lon]) {
        return new Coordinates(lat, lon);
    }

    static fromLonLat([lon, lat]) {
        return new Coordinates(lat, lon);
    }

    static fromObject(obj) {
        return new Coordinates(obj.lat, obj.lon);
    }

    toLatLon() {
        return [this.lat, this.lon];
    }

    toLonLat() {
        return [this.lon, this.lat];
    }

}

class PointObject {
    constructor(coordinates, radius) {
        this.coordinates = coordinates;
        this.radius = radius;
    }

    static fromObject(obj) {
        return new PointObject(Coordinates.fromObject(obj.coordinates), obj.radius);
    }
}

class Polygon {
    constructor(outerRing, holes) {
        this.outerRing = outerRing;
        this.holes = holes;
    }
    static fromObject(obj) {
        return new Polygon(
            obj.outerRing.map(Coordinates.fromObject),
            obj.holes.map(arrayOfCoordinateArrays => arrayOfCoordinateArrays.map(Coordinates.fromObject))
        );
    }
}

class MultiPolygon {
    constructor(listOfPolygons) {
        this.listOfPolygons = listOfPolygons;
    }

    static fromObject(obj) {
        return new MultiPolygon(obj.polygons.map(Polygon.fromObject));
    }
}

//TODO
class LineString {
}

