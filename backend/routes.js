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
const route_attractions = async function (req, res) {
    const categories = req.query.categories;
    const page = req.query.page
    const offset = 10 * (page - 1)
   
    connection.query(
    `WITH temp AS (
        (SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories, c.name
        FROM Attractions a JOIN Cities c on a.cityid = c.id
        WHERE a.categories LIKE '%${categories[1]}%')
        UNION
        (SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories, c.name
        FROM Attractions a JOIN Cities c on a.cityid = c.id
        WHERE a.categories LIKE '%${categories[2]}%')
        UNION
    (SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories, c.name
    FROM Attractions a JOIN Cities c on a.cityid = c.id
    WHERE a.categories LIKE '%${categories[3]}%'))
    SELECT *
    FROM temp
    ORDER BY temp.rating desc
    LIMIT 10 OFFSET ${offset};`, (err, data) => {
      if (err) {
          console.log(err);
          res.json({});
      } else {
        res.json(data.rows);
      }
    });
}


// Route 4: GET /routes/:numInt
const routes = async function (req, res) {
  const numInt = req.params.numInt
  const startCity = req.query.startCity;
  const startState = req.query.startState;
  const endCity = req.query.endCity;
  const endState = req.query.endState;
  const orderBy = req.query.orderBy ?? '';
 
  if (numInt == 0) {
    connection.query(
      `SELECT src.name, src.state, tgt.name, tgt.state, (r1.distance) AS total_distance
      FROM routes r1
         JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
         JOIN (SELECT id, name, state FROM cities) tgt ON r1.endCity = tgt.id
      WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' AND tgt.state LIKE '%${endState}%'`, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
          res.json(data.rows);
        }
      });
  } else if (numInt == 1) {
    connection.query(
      `SELECT src.name, src.state, int1.name, int1.state, tgt.name, tgt.state, (r1.distance + r2.distance) AS total_distance
      FROM routes r1 JOIN routes r2 ON r1.endCity = r2.startCity
         JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
         JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
         JOIN (SELECT id, name, state FROM cities) tgt ON r2.endCity = tgt.id
      WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' AND tgt.state LIKE '%${endState}%'`, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
          res.json(data.rows);
        }
      });
  } else if (numInt == 2) {
    connection.query(
      `SELECT src.name, src.state, int1.name, int1.state, int2.name, int2.state, tgt.name, tgt.state, (r1.distance + r2.distance + r3.distance) AS total_distance
      FROM routes r1 JOIN routes r2 ON r1.endCity = r2.startCity
         JOIN routes r3 ON r2.endCity = r3.startCity
         JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
         JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
         JOIN (SELECT id, name, state FROM cities) int2 ON r2.endCity = int2.id
         JOIN (SELECT id, name, state FROM cities) tgt ON r3.endCity = tgt.id
      WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' AND tgt.state LIKE '%${endState}%'`, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
          res.json(data.rows);
        }
      });
  } else if (numInt == 3) {
    connection.query(
      `SELECT src.name, src.state, int1.name, int1.state, int2.name, int2.state, int3.name, int3.state, tgt.name, tgt.state, (r1.distance + r2.distance + r3.distance + r4.distance) AS total_distance
      FROM routes r1 JOIN routes r2 ON r1.endcity = r2.startcity
         JOIN routes r3 ON r2.endcity = r3.startcity
         JOIN routes r4 ON r3.endcity = r4.startcity
         JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
         JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
         JOIN (SELECT id, name, state FROM cities) int2 ON r2.endCity = int2.id
         JOIN (SELECT id, name, state FROM cities) int3 ON r3.endCity = int3.id
         JOIN (SELECT id, name, state FROM cities) tgt ON r4.endCity = tgt.id
      WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' AND tgt.state LIKE '%${endState}%'`, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
          res.json(data.rows);
        }
      });
  } else {
    console.log(err);
    res.json({});
  }
}
   
// Route 5: GET /subcategories/:cityid
const subcategories = async function (req, res) {
  connection.query(
  `SELECT unnest(string_to_array(a.subcategories, ', ')) AS subcategories
  FROM attractions a
  WHERE a.cityid = ${req.params.cityid};`, (err, data) => {
    if (err) {
        console.log(err);
        res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
}
   
// Route 6: GET /numSubcategories/:cityid
const numSubcategories = async function (req, res) {
  connection.query(
  `SELECT DISTINCT category, COUNT(*) AS attractionCount
  FROM (
     SELECT unnest(string_to_array(a.categories, ', ')) AS category
     FROM attractions a
     WHERE a.cityid = ${req.params.cityid}
  ) AS split_categories
  GROUP BY category;`, (err, data) => {
    if (err) {
        console.log(err);
        res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
}

const cityRecs = async function(req, res) {
 connection.query(
`SELECT closeCity FROM
((SELECT endCity as closeCity, Routes.distance as distance
			FROM Routes JOIN Cities ON Cities.id = Routes.startCity
			WHERE Cities.name = ${name})
		UNION
(SELECT  startCity as closeCity, Routes.distance as distance
			FROM Routes JOIN Cities ON Cities.id = Routes.endCity
			WHERE Cities.name = ${name})) as A
ORDER BY distance
LIMIT 10;`, (err, data) => {
   if (err) {
     console.log(err);
     res.json({});
   } else {
     	res.json(data.rows[0]);
     }
   });
}

const routesByAttractions = async function(req, res) {
 connection.query(
`WITH B AS
(SELECT * FROM Attractions 
ORDER BY rating DESC)	
SELECT * 
FROM Routes JOIN B ON B.cityId = Routes.endCity
LIMIT 10;`, (err, data) => {
   if (err) {
     console.log(err);
     res.json({});
   } else {
     	res.json(data.rows[0]);
     }
   });
}

const rankCitiesByUniqueAttractions = async function(req, res) {
  const cityIds = req.query.cityIds;

  connection.query(
 `WITH temp AS (SELECT c.id AS CityID, c.name AS CityName, COUNT(DISTINCT a.id) AS NumAttractions
  FROM Cities c
  LEFT JOIN Attractions a ON c.id = a.cityid
  WHERE c.id IN (${cityIds})
  GROUP BY c.id, c.name
  ORDER BY NumAttractions DESC)
 SELECT temp.CityName
 FROM temp;`, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
        res.json(data.rows);
      }
    });
 }


module.exports = {
    city_info,
    city_distance,
    route_attractions,
    routes, 
    subcategories,
    numSubcategories,
    cityRecs,
    routesByAttractions
}
