const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js

// REPLACE THESE WITH OUR ROUTES
app.get('/cities/:id', routes.city_info);
app.get('/cities/distance/:businessid', routes.city_distance);
app.get('/attractions', routes.route_attractions);
app.get('/routes/:numInt', routes.routes);
app.get('/subcategories/:cityid', routes.subcategories);
app.get('/numSubcategories/:cityid', routes.numSubcategories);
app.get('/cityrecs/:id', routes.cityRecs);
app.get('/routesbyattractions', routes.routesByAttractions);
app.get('/cityrankbyattractions', routes.rankCitiesByUniqueAttractions);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;