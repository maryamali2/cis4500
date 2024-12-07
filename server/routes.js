const { Pool, types } = require('pg');
const config = require('./config.json');

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10));

// Create PostgreSQL connection
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

// No need to call connect explicitly with Pool; it manages its own connections

/******************
 * ROUTES *
 ******************/

const testRoute = async function (req, res) {
  res.json("HELLO");
}

// Route 1: GET /cities?cityName=Atlanta
const city_info = async function (req, res) {
  const name = req.query.cityName;
  connection.query(
    `SELECT c.city AS city, c.state_name AS state, c.lat AS latitude, c.lng AS longitude, c.population, c.density
     FROM CitiesData c
     WHERE c.city = '${name}';`,
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (data.rows.length === 0) {
        return res.json({});
      }
      res.json(data.rows[0]);
    }
  );
}

// Route 2: GET /cities/distance?businessId=1
const city_distance = async function (req, res) {
  const businessId = req.query.businessId;
  connection.query(
    `SELECT (ACOS(SIN((c.latitude/(180/PI()))) * SIN((a.latitude/(180/PI()))) + COS((c.latitude/(180/PI()))) * COS((a.latitude/(180/PI())))*COS((a.longitude/(180/PI())) - (c.longitude/(180/PI())))) * 3963) AS distance
    FROM Attractions a JOIN Cities c ON a.cityid = c.id
     WHERE a.id = '${businessId}';`,
    [],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (data.rows.length === 0) {
        return res.json({});
      }
      res.json(data.rows[0]);
    }
  );
}

// Route 3: GET /attractions?cityId=1&category1=Automotive&category2=...
// COMPLEX QUERY
const route_attractions = async function (req, res) {
  const id = parseInt(req.query.cityId, 10);
  const category1 = req.query.category1;
  const category2 = req.query.category2;
  const category3 = req.query.category3;

  connection.query(
  `WITH temp AS (
      (SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories, c.name
      FROM Attractions a JOIN CityInfo c on a.cityid = c.id
      WHERE a.categories LIKE '%${category1}%' and c.id = ${id}) 
      UNION
      (SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories, c.name
      FROM Attractions a JOIN CityInfo c on a.cityid = c.id
      WHERE a.categories LIKE '%${category2}%' and c.id = ${id})
      UNION
      (SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories, c.name
      FROM Attractions a JOIN CityInfo c on a.cityid = c.id
      WHERE a.categories LIKE '%${category3}%' and c.id = ${id}))
      SELECT *
      FROM temp
      ORDER BY temp.rating desc
      LIMIT 10;`, (err, data) => {
    if (err) {
        console.log(err);
        res.json({});
    } else {
      res.json(data.rows);
    }
  });
}

// Route 4: GET /routes?numInt=1&startCity=Seattle&startState=Washington&endCity=Portland&endState=Oregon
const routes = async function (req, res) {
  const numInt = parseInt(req.query.numInt,10);
  const startCity = req.query.startCity;
  const startState = req.query.startState;
  const endCity = req.query.endCity;
  const endState = req.query.endState;


  if (numInt == 0) {
    connection.query(
     `SELECT src.name as sourceCity, src.state as sourceState, tgt.name destinationCity, tgt.state as destinationState, r1.distance AS total_distance
     FROM routes r1
        JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
        JOIN (SELECT id, name, state FROM cities) tgt ON r1.endCity = tgt.id
     WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' AND tgt.state LIKE '%${endState}% AND src.name <> tgt.name';`, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
          res.json(data.rows);
        }
      });
  } else if (numInt == 1) {
    connection.query(
      `SELECT src.name as sourceCity, src.state as sourceState, int1.name as stopCity, int1.state as stopState, tgt.name as destinationCity, tgt.state as destinationState, (r1.distance + r2.distance) AS total_distance
     FROM routes r1 JOIN routes r2 ON r1.endCity = r2.startCity
        JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
        JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
        JOIN (SELECT id, name, state FROM cities) tgt ON r2.endCity = tgt.id
     WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' AND tgt.state LIKE '%${endState}%' AND src.name <> int1.name 
     AND int1.name <> tgt.name AND src.name <> tgt.name LIMIT 10;`, (err, data) => {
         if (err) {
             console.log(err);
             res.json({});
         } else {
           res.json(data.rows);
         }
       });
  } else if (numInt == 2) {
    connection.query(
      `SELECT src.name as sourceCity, src.state as sourceState, int1.name as stopCity1, int1.state as stopState1, int2.name as stopCity2, int2.state as stopState2, tgt.name as destinationCity, tgt.state as destinationState, (r1.distance + r2.distance + r3.distance) AS total_distance
     FROM routes r1 JOIN routes r2 ON r1.endCity = r2.startCity
        JOIN routes r3 ON r2.endCity = r3.startCity
        JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
        JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
        JOIN (SELECT id, name, state FROM cities) int2 ON r2.endCity = int2.id
        JOIN (SELECT id, name, state FROM cities) tgt ON r3.endCity = tgt.id
     WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' 
     AND tgt.state LIKE '%${endState}%' AND src.name <> int1.name AND int1.name <> int2.name AND 
     int2.name <> tgt.name AND src.name <> int2.name AND src.name <> tgt.name AND int2.name <> tgt.name LIMIT 10;`, (err, data) => {
         if (err) {
             console.log(err);
             res.json({});
         } else {
           res.json(data.rows);
         }
       });
  } else if (numInt == 3) {
    connection.query(
      `SELECT src.name as sourceCity, src.state as sourceState, int1.name as stopCity1, int1.state as stopState1, int2.name as stopCity2, int2.state as stopState2, int3.name as stopCity3, int3.state as stopState3, tgt.name as destinationCity, tgt.state as destinationState, (r1.distance + r2.distance + r3.distance + r4.distance) AS total_distance
     FROM routes r1 JOIN routes r2 ON r1.endcity = r2.startcity
        JOIN routes r3 ON r2.endcity = r3.startcity
        JOIN routes r4 ON r3.endcity = r4.startcity
        JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
        JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
        JOIN (SELECT id, name, state FROM cities) int2 ON r2.endCity = int2.id
        JOIN (SELECT id, name, state FROM cities) int3 ON r3.endCity = int3.id
        JOIN (SELECT id, name, state FROM cities) tgt ON r4.endCity = tgt.id
     WHERE src.name LIKE '%${startCity}%' AND src.state LIKE '%${startState}%' AND tgt.name LIKE '%${endCity}%' AND tgt.state LIKE '%${endState}%'
     AND src.name <> int1.name AND int1.name <> int2.name AND int2.name <> int3.name AND int3.name <> tgt.name AND 
     src.name <> int2.name AND src.name <> int3.name AND src.name <> tgt.name AND int1.name <> int3.name AND 
     int1.name <> tgt.name AND int2.name <> tgt.name LIMIT 10;`, (err, data) => {
         if (err) {
             console.log(err);
             res.json({});
         } else {
           res.json(data.rows);
         }
       });
  } else {
    return res.json("Please enter a valid number of intermediate routes");
  }
}

// Route 5: GET /subcategories?cityId=1
const subcategories = async function (req, res) {
  const cityid = parseInt(req.query.cityId, 10);
  connection.query(
    `SELECT unnest(string_to_array(a.subcategories, ', ')) AS subcategory
     FROM attractions a
     WHERE a.cityid = ${cityid};`,
    [],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (data.rows.length === 0) {
        return res.json([]);
      }
      // return the entire list of subcategories as an array
      const subs = data.rows.map(row => row.subcategory);
      res.json(subs);
    }
  );
}

// Route 6: GET /numSubcategories?cityId=1
const numSubcategories = async function (req, res) {
  const cityid = parseInt(req.query.cityId, 10);
  connection.query(
    `SELECT category, COUNT(*) AS attractioncount
     FROM (
       SELECT unnest(string_to_array(a.categories, ', ')) AS category
       FROM attractions a
       WHERE a.cityid = ${cityid}
     ) AS split_categories
     GROUP BY category
     ORDER BY attractioncount DESC;`,
    [],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(data.rows);
    }
  );
}

// Route 7: GET /cityrecs?cityId=1
const cityRecs = async function(req, res) {
  const id = parseInt(req.query.cityId, 10);
  connection.query(
    `SELECT closeCity FROM (
       (SELECT endCity as closeCity, Routes.distance as distance
        FROM Routes JOIN Cities ON Cities.id = Routes.startCity
        WHERE Cities.id = ${id})
       UNION
       (SELECT startCity as closeCity, Routes.distance as distance
        FROM Routes JOIN Cities ON Cities.id = Routes.endCity
        WHERE Cities.id = ${id})
     ) as A
     ORDER BY distance
     LIMIT 10;`,
    [],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (data.rows.length === 0) {
        return res.json([]);
      }
      const recs = data.rows.map(row => row.closecity);
      res.json(recs);
    }
  );
}

// Route 8: GET /routesbyattractions
const routesByAttractions = async function(req, res) {
  connection.query(
    `WITH B AS (
       SELECT * FROM Attractions
       ORDER BY rating DESC
     )
     SELECT * 
     FROM Routes JOIN B ON B.cityId = Routes.endCity
     LIMIT 10;`,
    [],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (data.rows.length === 0) {
        return res.json([]);
      }
      res.json(data.rows);
    }
  );
}

// Route 9: GET /cityrankbyattractions?cityIds=1,2,3,...
const rankCitiesByUniqueAttractions = async function(req, res) {
  const cityIds = req.query.cityIds; 
  if (!cityIds) {
    return res.status(400).json({ error: 'cityIds query param required' });
  }

  const cityIdsArray = cityIds.split(',').map(id => parseInt(id, 10)).filter(Boolean);
  if (cityIdsArray.length === 0) {
    return res.json([]);
  }

  connection.query(
    `WITH temp AS (
       SELECT c.id AS CityID, c.name AS CityName, COUNT(DISTINCT a.id) AS NumAttractions
       FROM Cities c
       LEFT JOIN Attractions a ON c.id = a.cityid
       WHERE c.id = ANY($1)
       GROUP BY c.id, c.name
       ORDER BY NumAttractions DESC
     )
     SELECT temp.CityName
     FROM temp;`,
    [cityIdsArray],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(data.rows.map(row => row.cityname));
    }
  );
}

// Route 10: GET /randomAttraction?cityId=19511&attractionIds=1,2,3,...
const randomAttraction = async function(req, res) {
  const cityId = req.query.cityId;
  const attractionIds = req.query.attractionIds; 
  if (!attractionIds) {
    return res.status(400).json({ error: 'attractionids query param required' });
  }

  connection.query(
    `WITH temp as (
      SELECT *
      FROM attractions
      WHERE id NOT IN (${attractionIds})
    )
    SELECT t.name, t.address, t.latitude, t.longitude, t.rating, t.subcategories, c.name
    FROM temp t JOIN CityInfo c on t.cityid = c.id
    WHERE c.id = ${cityId}
    ORDER BY RANDOM()
    LIMIT 1`,
    [],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(data.rows[0]);
    }
  );
}


module.exports = {
  city_info,
  city_distance,
  route_attractions,
  routes, 
  subcategories,
  numSubcategories,
  cityRecs,
  routesByAttractions, 
  rankCitiesByUniqueAttractions,
  testRoute
};
