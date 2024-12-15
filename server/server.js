const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
app.use(cors({ origin: '*' }));

// Serve index.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/src/pages/index.html'));
});

// Serve routes.html at /routes.html
app.get('/routes.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/src/pages/routes.html'));
});

// Define the API endpoints as before
app.get('/cities', routes.city_info);
app.get('/cities/distance', routes.city_distance);
app.get('/attractions', routes.route_attractions);
app.get('/routes', routes.routes);
app.get('/subcategories', routes.subcategories);
app.get('/topCityCategories', routes.topCityCategories);
app.get('/cityrecs', routes.cityRecs);
app.get('/routesbyattractions', routes.routesByAttractions);
app.get('/cityrankbyattractions', routes.rankCitiesByUniqueAttractions);
app.get('/backupAttractions', routes.backupAttractions);
app.get('/randomAttraction', routes.randomAttraction);
app.get('/cityNumRoutesAndAvgDist', routes.cityNumRoutesAndAvgDist);
app.get('/subattractions', routes.route_subattractions);
app.get('/cityrankbyattractionsbackup', routes.rankCitiesByUniqueAttractionsBackup);

// Do not listen on a port - this is serverless
// app.listen(...) is removed

module.exports = app;
