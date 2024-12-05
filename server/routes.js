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

// Route 1: GET /cities/:id
const city_info = async function (req, res) {
  const cityId = req.params.id;
  connection.query(
    `SELECT c.city AS city, c.state_name AS state, c.lat AS latitude, c.long AS longitude, c.population, c.density
     FROM Cities c
     WHERE c.name = $1;`,
    [cityId],
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

// Route 2: GET /cities/distance/:businessid
const city_distance = async function (req, res) {
  const businessId = req.params.businessid;
  connection.query(
    `SELECT (SQRT(SIN((a.latitude - c.latitude)/2)*SIN((a.latitude - c.latitude)/2) 
            + COS(c.latitude)*COS(a.latitude)*SIN((a.longitude - c.longitude)/2)*SIN((a.longitude - c.longitude)/2)) * 7918) AS distance
     FROM Attractions a JOIN Cities c ON a.cityid = c.id
     WHERE a.id = $1;`,
    [businessId],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (data.rows.length === 0) {
        return res.json({});
      }
      res.json(data.rows[0].distance);
    }
  );
}

// Route 3: GET /attractions?categories=...&page=...
const route_attractions = async function (req, res) {
  let { categories, page } = req.query;
  // Ensure categories is an array
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ error: 'categories must be provided as an array of strings' });
  }
  page = parseInt(page, 10) || 1;
  const offset = 10 * (page - 1);

  // Build the query dynamically based on categories
  // This assumes categories[1], categories[2], categories[3] exist.
  // If not guaranteed, add more checks.
  // Example uses only indices 1,2,3 as in original code.
  const cats = categories.slice(1,4); // categories at indexes 1,2,3
  const params = [];
  let unionParts = [];

  cats.forEach((cat, idx) => {
    params.push(`%${cat}%`);
    unionParts.push(`
      SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories, c.name as city_name
      FROM Attractions a JOIN Cities c ON a.cityid = c.id
      WHERE a.categories LIKE $${params.length}`);
  });

  const unionQuery = unionParts.join(' UNION ');

  const finalQuery = `
    WITH temp AS (
      ${unionQuery}
    )
    SELECT *
    FROM temp
    ORDER BY rating DESC
    LIMIT 10 OFFSET $${params.length+1};
  `;

  params.push(offset);

  connection.query(finalQuery, params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(data.rows);
  });
}

// Route 4: GET /routes/:numInt?startCity=...&startState=...&endCity=...&endState=...
const routes = async function (req, res) {
  const numInt = parseInt(req.params.numInt, 10);
  const startCity = req.query.startCity || '';
  const startState = req.query.startState || '';
  const endCity = req.query.endCity || '';
  const endState = req.query.endState || '';

  // We'll store parameters and a query template
  let query = '';
  let params = [
    `%${startCity}%`,
    `%${startState}%`,
    `%${endCity}%`,
    `%${endState}%`
  ];

  if (numInt === 0) {
    query = `
      SELECT src.name, src.state, src.id, tgt.name as tname, tgt.state as tstate, tgt.id as tid, r1.distance AS total_distance, AVG(src_rating.stars + tgt_rating.stars)/2 AS avg_rating
      FROM routes r1
      JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
      JOIN attractions src_rating ON src.id = src_rating.cityid
      JOIN (SELECT id, name, state FROM cities) tgt ON r1.endCity = tgt.id
      JOIN attractions tgt_rating ON tgt.id = tgt_rating.cityid
      WHERE src.name LIKE $1 AND src.state LIKE $2 AND tgt.name LIKE $3 AND tgt.state LIKE $4
      GROUP BY src.name, src.state, src.id, tgt.name, tgt.state, tgt.id, r1.distance
    `;
  } else if (numInt === 1) {
    query = `
      SELECT src.name, src.state, src.id, int1.name as intname, int1.state as intstate, int1.id as intid, 
             tgt.name as tname, tgt.state as tstate, tgt.id as tid,
             (r1.distance + r2.distance) AS total_distance
      FROM routes r1 JOIN routes r2 ON r1.endCity = r2.startCity
      JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
      JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
      JOIN (SELECT id, name, state FROM cities) tgt ON r2.endCity = tgt.id
      WHERE src.name LIKE $1 AND src.state LIKE $2 AND tgt.name LIKE $3 AND tgt.state LIKE $4
    `;
  } else if (numInt === 2) {
    query = `
      SELECT src.name, src.state, src.id, 
             int1.name as int1name, int1.state as int1state, int1.id as int1id, 
             int2.name as int2name, int2.state as int2state, int2.id as int2id,
             tgt.name as tname, tgt.state as tstate, tgt.id as tid,
             (r1.distance + r2.distance + r3.distance) AS total_distance
      FROM routes r1 
      JOIN routes r2 ON r1.endCity = r2.startCity
      JOIN routes r3 ON r2.endCity = r3.startCity
      JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
      JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
      JOIN (SELECT id, name, state FROM cities) int2 ON r2.endCity = int2.id
      JOIN (SELECT id, name, state FROM cities) tgt ON r3.endCity = tgt.id
      WHERE src.name LIKE $1 AND src.state LIKE $2 AND tgt.name LIKE $3 AND tgt.state LIKE $4
    `;
  } else if (numInt === 3) {
    query = `
      SELECT src.name, src.state, src.id, 
             int1.name as int1name, int1.state as int1state, int1.id as int1id, 
             int2.name as int2name, int2.state as int2state, int2.id as int2id,
             int3.name as int3name, int3.state as int3state, int3.id as int3id,
             tgt.name as tname, tgt.state as tstate, tgt.id as tid,
             (r1.distance + r2.distance + r3.distance + r4.distance) AS total_distance
      FROM routes r1 
      JOIN routes r2 ON r1.endcity = r2.startcity
      JOIN routes r3 ON r2.endcity = r3.startcity
      JOIN routes r4 ON r3.endcity = r4.startcity
      JOIN (SELECT id, name, state FROM cities) src ON r1.startCity = src.id
      JOIN (SELECT id, name, state FROM cities) int1 ON r1.endCity = int1.id
      JOIN (SELECT id, name, state FROM cities) int2 ON r2.endCity = int2.id
      JOIN (SELECT id, name, state FROM cities) int3 ON r3.endCity = int3.id
      JOIN (SELECT id, name, state FROM cities) tgt ON r4.endCity = tgt.id
      WHERE src.name LIKE $1 AND src.state LIKE $2 AND tgt.name LIKE $3 AND tgt.state LIKE $4
    `;
  } else {
    return res.status(400).json({ error: 'Invalid number of intermediates' });
  }

  connection.query(query, params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(data.rows);
  });
}

// Route 5: GET /subcategories/:cityid
const subcategories = async function (req, res) {
  const cityid = parseInt(req.params.cityid, 10);
  connection.query(
    `SELECT unnest(string_to_array(a.subcategories, ', ')) AS subcategory
     FROM attractions a
     WHERE a.cityid = $1;`,
    [cityid],
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

// Route 6: GET /numSubcategories/:cityid
const numSubcategories = async function (req, res) {
  const cityid = parseInt(req.params.cityid, 10);
  connection.query(
    `SELECT category, COUNT(*) AS attractioncount
     FROM (
       SELECT unnest(string_to_array(a.categories, ', ')) AS category
       FROM attractions a
       WHERE a.cityid = $1
     ) AS split_categories
     GROUP BY category
     ORDER BY attractioncount DESC;`,
    [cityid],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(data.rows);
    }
  );
}

// Route 7: GET /cityrecs/:id
const cityRecs = async function(req, res) {
  const id = parseInt(req.params.id, 10);
  connection.query(
    `SELECT closeCity FROM (
       (SELECT endCity as closeCity, Routes.distance as distance
        FROM Routes JOIN Cities ON Cities.id = Routes.startCity
        WHERE Cities.id = $1)
       UNION
       (SELECT startCity as closeCity, Routes.distance as distance
        FROM Routes JOIN Cities ON Cities.id = Routes.endCity
        WHERE Cities.id = $1)
     ) as A
     ORDER BY distance
     LIMIT 10;`,
    [id],
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
