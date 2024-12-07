const express = require('express');
const cors = require('cors');
const config = require('./config.json');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// Define the API endpoints
app.get('/', routes.testRoute); // works
app.get('/cities', routes.city_info); // works
app.get('/cities/distance', routes.city_distance); // works
app.get('/attractions', routes.route_attractions); // works
app.get('/routes', routes.routes); // works
app.get('/subcategories', routes.subcategories); // works
app.get('/numSubcategories', routes.numSubcategories); // works
app.get('/cityrecs', routes.cityRecs); // works
app.get('/routesbyattractions', routes.routesByAttractions); // works
app.get('/cityrankbyattractions', routes.rankCitiesByUniqueAttractions); // works

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
