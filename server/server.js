const express = require('express');
const cors = require('cors');
const config = require('./config.json');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// Define the API endpoints
app.get('/', routes.testRoute); 
app.get('/cities', routes.city_info); 
app.get('/cities/distance', routes.city_distance); 
app.get('/attractions', routes.route_attractions); 
app.get('/routes', routes.routes); 
app.get('/subcategories', routes.subcategories); 
app.get('/numSubcategories', routes.numSubcategories); 
app.get('/cityrecs', routes.cityRecs); 
app.get('/routesbyattractions', routes.routesByAttractions); 
app.get('/cityrankbyattractions', routes.rankCitiesByUniqueAttractions); 
app.get('/backupAttractions', routes.backupAttractions);
app.get('/randomAttraction', routes.randomAttraction);
app.get('/cityNumRoutesAndAvgDist', routes.cityNumRoutesAndAvgDist);
app.get('/subattractions', routes.route_subattractions);



app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
