const { Pool, types } = require('pg');
const config = require('./config.json')

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

/******************
 * ROUTES *
 ******************/

// Route 1: GET /cities/:id
const city_info = async function (req, res) {
    connection.query(
    `SELECT c.city as city, c.state_name as state, c.lat as latitude, c.long as longitude, c.population,
    c.density
    FROM Cities c
    WHERE c.name = ${req.params.id};`, (err, data) => {
      if (err) {
          console.log(err);
          res.json({});
      } else {
        res.json(data.rows[0]);
      }
    });
}

// Route 2: GET /cities/distance/:businessid
const city_distance = async function (req, res) {
    connection.query(
    `SELECT (SQRT(SIN((a.latitude - c.latitude)/2)*SIN((a.latitude - c.latitude)/2) + COS(c.latitude)*COS(a.latitude)*SIN(a.longitude - c.longitude)*SIN(a.longitude-c.longitude)) * 7918) as distance
   FROM Attractions a JOIN Cities c on a.cityid = c.id
   WHERE a.id = '${req.params.businessid}';
   `, (err, data) => {
      if (err) {
          console.log(err);
          res.json({});
      } else {
        res.json(data.rows[0].distance);
      }
    });
}

// Route 3: GET /attractions

   
   

module.exports = {
    city_info,
    city_distance
}
