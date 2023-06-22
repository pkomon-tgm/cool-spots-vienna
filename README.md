# Cool Spots in Vienna

Visualization of cool (in the literal sense: springs, bodies of water, and vegetation) areas of Vienna in an interactive web application using [Leaflet.js](https://leafletjs.com/) and [D3](https://d3js.org/).
The data was retrieved from the [Open Data portal of the City of Vienna](https://www.data.gv.at/auftritte/?organisation=stadt-wien).

Demo is avaiable [here](https://pkomon-tgm.github.io/cool-spots-vienna/).

## Some notes on usage

- Some layers highlight areas ("Grünflächen", "Stehende Gewässer", "Grüngürtel", some layers highlight points ("Badestellen", "Trinkbrunnen", "Schwimmbäder", "Monumentalbrunnen", "Parkanlagen") and some layers show hexagonal binnings ("Bäume (Hexbins)", "Trinkbrunnen (Hexbins)").
- "Bäume" layer takes some time to load as there are a lot of items.
- Hexagons in hexbin layers can be clicked to show the number of items it contains in a popup.
- Icons can be displayed by activating the checkmark in the bottom left corner. This works for all point layers except for "Bäume" (as there are way too many of those).
- The (map) tile provider can be changed as well. We did not implement any of the selectable tile servers, we are only using publically available ones.

## Disclaimer
This project was part of the third exercise of the course Information Visualization at TU Wien.
This is NOT the submitted version and it does NOT contain the original data, but slightly preprocessed versions.
In the submission, the preprocessing is done in the backend, written in Python using Flask and the requests package to pull and preprocess the data.
For this version, we moved most (but not all) of the preprocessing steps to the frontend. However, with the partly preprocessed data and all other
preprocessing steps in the frontend, it should be functionally equivalent to the submitted version.
