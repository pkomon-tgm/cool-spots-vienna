function main() {
    // TODO could add radius slider for hex grids, would be really cool

    let badestellenPoints = [];
    let monumentalbrunnenPoints = [];
    let schwimmbaederPoints = [];
    let trinkbrunnenPoints = [];
    let parkanlagenPoints = [];

    let useIcons = {
        "badestelle": false,
        "monumentalbrunnen": false,
        "schwimmbad": false,
        "trinkbrunnen": false,
        "parkanlage": false
    };

    let trinkbrunnenLayerGroup = L.layerGroup();
    let badestellenLayerGroup = L.layerGroup();
    let schwimmbaederLayerGroup = L.layerGroup();
    let monumentalbrunnenLayerGroup = L.layerGroup();
    let parkanlagenLayerGroup = L.layerGroup();

    map.layerControl.addOverlay(trinkbrunnenLayerGroup, "Trinkbrunnen");
    map.layerControl.addOverlay(monumentalbrunnenLayerGroup, "Monumentalbrunnen");
    map.layerControl.addOverlay(schwimmbaederLayerGroup, "Schwimmbaeder");
    map.layerControl.addOverlay(badestellenLayerGroup, "Badestellen");
    map.layerControl.addOverlay(parkanlagenLayerGroup, "Parkanlagen");

    let DefaultIconClass = L.Icon.extend({
        options: {
            iconSize: [20, 20]
        }
    });
    let icons = {
        "badestelle": new DefaultIconClass({iconUrl: "icons/Badestelle.svg"}),
        "monumentalbrunnen": new DefaultIconClass({iconUrl: "icons/Monumentalbrunnen.svg"}),
        "schwimmbad": new DefaultIconClass({iconUrl: "icons/Schwimmbad.svg"}),
        "trinkbrunnen": new DefaultIconClass({iconUrl: "icons/Trinkbrunnen.svg"}),
        "parkanlage": new DefaultIconClass({iconUrl: "icons/Parkanlage.svg"}),
    }

    // from https://colorbrewer2.org/
    const COLORS_GREEN_6 = ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"];
    const COLORS_GREEN_5 = ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"];
    const COLORS_BLUE_6 = ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#2b8cbe", "#045a8d"];
    const COLORS_BLUE_3 = ["#ece7f2", "#a6bddb", "#2b8cbe"];


    function createLayerGroupWithLegend(legend) {
        let layerGroup = L.layerGroup();
        //TODO quite hacky way to override method, maybe use JavaScript's proper inheritance syntax constructs instead
        layerGroup.onAddOld = layerGroup.onAdd;
        layerGroup.onAdd = function (map) {
            this.onAddOld(map);
            this.myLegend = legend;
            this.myLegend.addTo(map);
        }
        layerGroup.onRemoveOld = layerGroup.onRemove;
        layerGroup.onRemove = function (map) {
            this.onRemoveOld(map);
            this.myLegend.remove();
        }
        return layerGroup
    }

    function createLegend(position, labels, colors) {
        if (colors.length !== labels.length) {
            throw new Error("labels and colors must have same length");
        }

        let legend = L.control({position: "bottomright"});
        legend.onAdd = (map) => {
            let div = L.DomUtil.create("div", "control");
            for (let i = 0; i < labels.length; i++) {
                //TODO do it in a safer way by using DOM manipulation API
                div.innerHTML += "<div class='legend-item'>"
                    + "<div style='background:" + colors[i] + "' class='legend-square'></div>&nbsp;"
                    + labels[i] + "</div>";
            }
            return div;
        };
        return legend;
    }

    let optionsControl = L.control({position: "bottomleft"});
    optionsControl.onAdd = (map) => {
        let containerDiv = L.DomUtil.create("div", "control");

        let rowDiv = L.DomUtil.create("div");

        let checkbox = L.DomUtil.create("input");
        checkbox.type = "checkbox";
        checkbox.id = "should_show_icons";
        checkbox.checked = false;
        checkbox.onchange = (event) => {
            const shouldShowIcons = event.target.checked;
            useIcons.badestelle = shouldShowIcons;
            useIcons.trinkbrunnen = shouldShowIcons;
            useIcons.monumentalbrunnen = shouldShowIcons;
            useIcons.schwimmbad = shouldShowIcons;
            useIcons.parkanlage = shouldShowIcons;

            updateBadestellen();
            updateTrinkbrunnen();
            updateMonumentalbrunnen();
            updateSchwimmbaeder();
            updateParkanlagen();

            console.log("is show icons enabled", shouldShowIcons);
        };

        let label = L.DomUtil.create("label");
        label.for = "should_show_icons";
        label.innerHTML = "Show icons";

        rowDiv.append(checkbox);
        rowDiv.append(label);

        containerDiv.append(rowDiv);

        return containerDiv;
    };
    optionsControl.addTo(map.mapObj);

    let projection = d3.geoMercator();

    let treeHexBinsLayerGroup = createLayerGroupWithLegend(
        createLegend("bottomright",
            ["1-2 Bäume", "3-4 Bäume", "5-6 Bäume", "7-8 Bäume", "mehr als 9 Bäume"],
            COLORS_GREEN_5)
    );
    map.layerControl.addOverlay(treeHexBinsLayerGroup, "Bäume (Hexbins)");

    let trinkbrunnenHexBinsLayerGroup = createLayerGroupWithLegend(
        createLegend("bottomright",
            ["= 1 TrinkbrunnenBaum", "= 2 Trinkbrunnen", "> 2 Trinkbrunnen"],
            COLORS_BLUE_3)
    );
    map.layerControl.addOverlay(trinkbrunnenHexBinsLayerGroup, "Trinkbrunnen (Hexbins)");

    map.mapObj.on("zoomend", (event) => {
        //console.log("zoom level changed: ", map.mapObj.getZoom());
        //TODO could dynamically update radius of hex bins and re-calculate
    });

    map.mapObj.on("moveend", (event) => {
        //console.log("zoom level changed: ", map.mapObj.getZoom());
    });

    function addHexBinsToLayer(points, layerGroup, getColor) {
        const HEX_GRID_RADIUS = 0.0025;
        let hexbin = d3.hexbin()
            .radius(HEX_GRID_RADIUS)
            .x(d => d[0])
            .y(d => d[1]);

        let projectedPoints = points
            .map(point => [point[1], point[0]]) //from [lat, lon] to [lon, lat]
            .map(point => projection(point));

        let bins = hexbin(projectedPoints);

        const hexagonData = hexbin.hexagon() // gives polygon path using "m", "l" and "z" SVG path commands
            .slice(1, -1) //strip "m" and "z" commands
            .split("l")
            .map(coord => coord.split(","))
            .map(coord => coord.map(parseFloat));

        const hexagonVertices = hexagonData.reduce(
            (acc, data, index) =>
                [...acc, index === 0 ? data : [acc[index - 1][0] + data[0], acc[index - 1][1] + data[1]]],
            []
        );

        let leafletHexagons = bins.map(bin => {
            const vertices = hexagonVertices.map(vertex => [vertex[0] + bin.x, vertex[1] + bin.y]);
            const projectedVertices = vertices
                .map(vertex => projection.invert(vertex))
                .map(vertex => [vertex[1], vertex[0]]);
            const color = getColor(bin.length);
            return L.polygon(projectedVertices,
                {
                    opacity: 0,
                    fillOpacity: 0.7,
                    fillColor: color,
                })
                .bindPopup("Contains " + bin.length);
        });
        leafletHexagons.forEach(leafletHexagon => layerGroup.addLayer(leafletHexagon));
    }


    function updatePointObjects(pointObjects, layerGroup, dotColor, useIcon = false, icon = undefined) {
        let leafletObjects = pointObjects.map(point => L.circle(point.coordinates.toLatLon(), {
            color: "black",
            weight: 0.5,
            opacity: 0.7,
            fillOpacity: 0.5,
            fillColor: dotColor,
            radius: point.radius
        }));

        if (useIcon) {
            let markers = pointObjects.map(point => L.marker(point.coordinates.toLatLon(), {
                icon: icon,
            }));
            leafletObjects = leafletObjects.concat(markers);
        }

        leafletObjects.forEach(object => layerGroup.addLayer(object));
    }

    function updateBadestellen() {
        badestellenLayerGroup.clearLayers();
        updatePointObjects(badestellenPoints, badestellenLayerGroup, "blue",
            useIcons["badestelle"], icons["badestelle"]);
    }
    function updateTrinkbrunnen() {
        trinkbrunnenLayerGroup.clearLayers();
        updatePointObjects(trinkbrunnenPoints, trinkbrunnenLayerGroup, "blue",
            useIcons["trinkbrunnen"], icons["trinkbrunnen"]);
    }

    function updateMonumentalbrunnen() {
        monumentalbrunnenLayerGroup.clearLayers();
        updatePointObjects(monumentalbrunnenPoints, monumentalbrunnenLayerGroup, "blue",
            useIcons["monumentalbrunnen"], icons["monumentalbrunnen"]);
    }
    function updateSchwimmbaeder() {
        schwimmbaederLayerGroup.clearLayers();
        updatePointObjects(schwimmbaederPoints, schwimmbaederLayerGroup, "blue",
            useIcons["schwimmbad"], icons["schwimmbad"]);
    }
    function updateParkanlagen() {
        parkanlagenLayerGroup.clearLayers();
        updatePointObjects(parkanlagenPoints, parkanlagenLayerGroup, "green",
            useIcons["parkanlage"], icons["parkanlage"]);
    }

    //getAndMapToPointObjects(BADESTELLEN_URL)
    mockPoints("data_orig/badestellen.json", 50)
        .then(pointObjects => {
            console.log("done loading badestellen", pointObjects);
            badestellenPoints.push(...pointObjects);
            updateParkanlagen();
        })
        .catch(err => console.log("failed loading badestellen", err));

    //getAndMapToPointObjects(BAEUME_URL)
    mockPointsTree("data_orig/baeume.json")
        .then(pointObjects => {
            let trees = pointObjects.map(point => point.coordinates.toLatLon());
            let circles = pointObjects.map(point => L.circle(point.coordinates.toLatLon(), {
                color: "black",
                weight: 0.5,
                opacity: 0.5,
                fillColor: "green",
                fillOpacity: 0.5,
                radius: point.radius
            }));
            map.layerControl.addOverlay(L.layerGroup(circles), "Bäume");
            console.log("done loading trees", circles);

            addHexBinsToLayer(trees, treeHexBinsLayerGroup, (numTrees) => {
                const intervals = [3, 5, 7, 9];
                let colorIndex = intervals.findIndex(value => numTrees < value);
                if (colorIndex === -1) {
                    colorIndex = COLORS_GREEN_5.length - 1;
                }
                return COLORS_GREEN_5[colorIndex];
            });
        })
        .catch(err => console.log("failed loading trees", err));

    //getAndMapToPointObjects(TRINKBRUNNEN_URL)
    mockPointsDrinkingFountain("data_orig/trinkbrunnen.json", 2)
    .then(pointObjects => {
            console.log("done loading trinkbrunnen", pointObjects);
            trinkbrunnenPoints.push(...pointObjects);
            updateTrinkbrunnen();

            let trinkbrunnenCoords = pointObjects.map(point => point.coordinates.toLatLon());
            addHexBinsToLayer(trinkbrunnenCoords, trinkbrunnenHexBinsLayerGroup, (numTrinkbrunnen) => {
                const value = Math.min(3, numTrinkbrunnen) / 3;
                const colorIndex = Math.floor(value * (COLORS_BLUE_3.length - 1));
                return COLORS_BLUE_3[colorIndex];
            });
        })
        .catch(err => console.log("failed loading drinking fountains", err));

    mockPoints("data_orig/monumentalbrunnen.json", 10)
    //getAndMapToPointObjects(MONUMENTALBRUNNEN_URL)
        .then(pointObjects => {
            console.log("done loading monumentalbrunnen", pointObjects);
            monumentalbrunnenPoints.push(...pointObjects);
            updateMonumentalbrunnen();
        })
        .catch(err => console.log("failed loading monumentalbrunnen", err));

    //getAndMapToPointObjects()
    mockPointsParkanlage("data_orig/parkanlagen.json")
        .then(pointObjects => {
            console.log("done loading parkanlagen", pointObjects);
            parkanlagenPoints.push(...pointObjects);
            updateParkanlagen();
        })
        .catch(err => console.log("failed loading parkanlagen", err));

    //getAndMapToPointObjects(SCHWIMMBAEDER_URL)
    mockPoints("data_orig/schwimmbaeder.json", 10)
        .then(pointObjects => {
            console.log("done loading schwimmbaeder", pointObjects);
            schwimmbaederPoints.push(...pointObjects);
            updatePointObjects(pointObjects, schwimmbaederLayerGroup, "blue");
        })
        .catch(err => console.log("failed loading monumentalbrunnen", err));

    //getAndMapToMultiPolygonObjects(OEFF_GRUENFLAECHEN_URL)
    mockMultiPolygons("data_orig/gruenflaechen.json")
        .then(multiPolygonObjects => {
            let listOfListsOfPolygons = multiPolygonObjects.map(multiPolygonObjects => multiPolygonObjects.listOfPolygons);
            let listOfAllPolygons = [].concat(...listOfListsOfPolygons);
            let polygons = listOfAllPolygons.map(
                polygon => L.polygon(
                    [
                        polygon.outerRing.map(coords => coords.toLatLon()),
                        polygon.holes.map(listOfCoords => listOfCoords.map(coords => coords.toLatLon())),
                    ],
                    {
                        opacity: 0,
                        fillColor: "green",
                        fillOpacity: 0.5
                    })
            );
            console.log("done loading gruenflaechen");
            map.layerControl.addOverlay(L.layerGroup(polygons), "Grünflächen");
        })
        .catch(err => console.log("failed loading gruenflaechen", err));

    //getAndMapToMultiPolygonObjects(STEHENDE_GEWAESSER_URL)
    mockMultiPolygons("data_orig/stehendegewaesser.json")
        .then(multiPolygonObjects => {
            let listOfListsOfPolygons = multiPolygonObjects.map(multiPolygonObjects => multiPolygonObjects.listOfPolygons);
            let listOfAllPolygons = [].concat(...listOfListsOfPolygons);
            let polygons = listOfAllPolygons.map(
                polygon => L.polygon(
                    [
                        polygon.outerRing.map(coords => coords.toLatLon()),
                        polygon.holes.map(listOfCoords => listOfCoords.map(coords => coords.toLatLon())),
                    ],
                    {
                        opacity: 0,
                        fillColor: "blue",
                        fillOpacity: 0.5
                    })
            );
            console.log("done loading stehende gewässer");
            map.layerControl.addOverlay(L.layerGroup(polygons), "Stehende Gewässer");
        })
        .catch(err => console.log("failed loading stehende gewässer", err));

    //getAndMapToMultiPolygonObjects(GRUENGUERTEL_URL)
    mockMultiPolygons("data_orig/gruenguertel.json")
        .then(multiPolygonObjects => {
            let listOfListsOfPolygons = multiPolygonObjects.map(multiPolygonObjects => multiPolygonObjects.listOfPolygons);
            let listOfAllPolygons = [].concat(...listOfListsOfPolygons);
            let polygons = listOfAllPolygons.map(
                polygon => L.polygon(
                    [
                        polygon.outerRing.map(coords => coords.toLatLon()),
                        polygon.holes.map(listOfCoords => listOfCoords.map(coords => coords.toLatLon())),
                    ],
                    {
                        opacity: 0.0,
                        fillColor: "green",
                        fillOpacity: 0.5
                    })
            );
            console.log("done loading grüngürtel");
            map.layerControl.addOverlay(L.layerGroup(polygons), "Grüngürtel");
        })
        .catch(err => console.log("failed loading grüngürtel", err));

}