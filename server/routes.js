const { Pool, types } = require('pg');
const config = require('./config.json');

types.setTypeParser(20, val => parseInt(val, 10));

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

const testRoute = async function (req, res) {
  res.json("HELLO");
}

// Route 1: GET /cities?cityName=Atlanta&stateName=Georgia
const city_info = async function (req, res) {
  const city = req.query.cityName;
  const state = req.query.stateName;
  connection.query(
    `SELECT c.id as cityid, c.name AS city, c.state AS state, c.latitude, c.longitude, c.population, c.density
     FROM CityInfo c
     WHERE c.name = '${city}' and c.state = '${state}';`,
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

// Route 2: GET /cities/distance?businessId=SAsO6NFUiVPENX3nJA-KiQ
const city_distance = async function (req, res) {
  const businessId = req.query.businessId;
  connection.query(
    `SELECT (ACOS(SIN((c.latitude/(180/PI()))) * SIN((a.latitude/(180/PI()))) + COS((c.latitude/(180/PI()))) * COS((a.latitude/(180/PI())))*COS((a.longitude/(180/PI())) - (c.longitude/(180/PI())))) * 3963) AS distance
    FROM Attractions a JOIN CityInfo c ON a.cityid = c.id
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

// Route 3: GET /attractions?cityId=11901&category1=Automotive&category2=...
const route_attractions = async function (req, res) {
  const id = parseInt(req.query.cityId, 10);
  const category1 = req.query.category1 || '';
  const category2 = req.query.category2 || '';
  const category3 = req.query.category3 || '';


  connection.query(
  `SELECT DISTINCT a.name as attraction, a.address as address, a.latitude, a.longitude, a.rating, a.categories, a.subcategories,
      MIN((ACOS(SIN((c.latitude/(180/PI()))) * SIN((a.latitude/(180/PI()))) + COS((c.latitude/(180/PI()))) * COS((a.latitude/(180/PI())))*COS((a.longitude/(180/PI())) - (c.longitude/(180/PI())))) * 3963)) as mindistance,
      MAX((ACOS(SIN((c.latitude/(180/PI()))) * SIN((a.latitude/(180/PI()))) + COS((c.latitude/(180/PI()))) * COS((a.latitude/(180/PI())))*COS((a.longitude/(180/PI())) - (c.longitude/(180/PI())))) * 3963)) as maxdistance,
      AVG((ACOS(SIN((c.latitude/(180/PI()))) * SIN((a.latitude/(180/PI()))) + COS((c.latitude/(180/PI()))) * COS((a.latitude/(180/PI())))*COS((a.longitude/(180/PI())) - (c.longitude/(180/PI())))) * 3963)) as avgdistance
FROM Attractions a JOIN Routes r on a.cityId = r.startcity JOIN CityInfo c ON c.id = r.endcity
WHERE (a.categories LIKE '%${category1}%' OR a.categories LIKE '%${category2}%' OR a.categories LIKE '%${category3}%') AND a.cityId = ${id}
GROUP BY attraction, address, a.latitude, a.longitude, a.rating, a.categories, a.subcategories
ORDER BY a.rating desc
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
    `SELECT c1.name as city1, c1.state as state1, c2.name as city2, c2.state as state2, r1.distance as total_distance
    FROM CityInfo c1 JOIN Routes r1 on c1.id = r1.startcity JOIN CityInfo c2 on c2.id = r1.endcity
    WHERE c1.name = '${startCity}' and c1.state = '${startState}' and c2.name = '${endCity}' and c2.state = '${endState}';`, (err, data) => {
       if (err) {
           console.log(err);
           res.json({});
       } else {
         res.json(data.rows);
       }
     });
  } else if (numInt == 1) {
    connection.query(
      `WITH outertemp AS
      (WITH temp as (
          SELECT c1.id as sourceid, c2.id as targetid
          FROM CityInfo c1, CityInfo c2
          WHERE c1.name = '${startCity}' and c1.state = '${startState}' and c2.name = '${endCity}' and c2.state = '${endState}'
          )
      SELECT r1.startcity as c1, r2.startcity as c2, r2.endcity as c3, (r1.distance + r2.distance) AS total_distance
      FROM Routes r1 JOIN Routes r2 ON r1.endcity = r2.startcity, temp
      WHERE r1.startcity = temp.sourceid AND r2.endcity = temp.targetid
          AND r2.endcity NOT IN (r1.startcity, r2.startcity)
  ORDER BY total_distance
  LIMIT 20)
SELECT c1.name as city1, c1.state as state1, c2.name as city2, c2.state as state2, c3.name as city3, c3.state as state3, outertemp.total_distance
FROM CityInfo c1, CityInfo c2, CityInfo c3, outertemp
WHERE c1.id = outertemp.c1 AND c2.id = outertemp.c2 AND c3.id = outertemp.c3;`, (err, data) => {
         if (err) {
             console.log(err);
             res.json({});
         } else {
           res.json(data.rows);
         }
       });
  } else if (numInt == 2) {
    connection.query(
      `WITH outertemp AS
      (WITH temp as (
          SELECT c1.id as sourceid, c2.id as targetid
          FROM CityInfo c1, CityInfo c2
          WHERE c1.name = '${startCity}' and c1.state = '${startState}' and c2.name = '${endCity}' and c2.state = '${endState}'
          )
      SELECT r1.startcity as c1, r2.startcity as c2, r3.startcity as c3, r3.endcity as c4, (r1.distance + r2.distance + r3.distance) AS total_distance
      FROM (SELECT * FROM routes WHERE distance >= 150) r1 JOIN (SELECT * FROM routes WHERE distance >= 150) r2 ON r1.endcity = r2.startcity
          JOIN (SELECT * FROM routes WHERE distance >= 150) r3 ON r2.endcity = r3.startcity, temp
      WHERE r1.startcity = temp.sourceid AND r3.endcity = temp.targetid
          AND r2.endcity NOT IN (r1.startcity, r2.startcity)
          AND r3.endcity NOT IN (r1.startcity, r2.startcity, r3.startcity)
  ORDER BY total_distance
  LIMIT 20)
SELECT c1.name as city1, c1.state as state1, c2.name as city2, c2.state as state2, c3.name as city3, c3.state as state3, c4.name as city4, c4.state as state4, outertemp.total_distance
FROM CityInfo c1, CityInfo c2, CityInfo c3, CityInfo c4, outertemp
WHERE c1.id = outertemp.c1 AND c2.id = outertemp.c2 AND c3.id = outertemp.c3 AND c4.id = outertemp.c4;`, (err, data) => {
         if (err) {
             console.log(err);
             res.json({});
         } else {
           res.json(data.rows);
         }
       });
  } else if (numInt == 3) {
    connection.query(
      `WITH outertemp AS
      (WITH temp as (
          SELECT c1.id as sourceid, c2.id as targetid
          FROM CityInfo c1, CityInfo c2
          WHERE c1.name = '${startCity}' and c1.state = '${startState}' and c2.name = '${endCity}' and c2.state = '${endState}'
          )
      SELECT r1.startcity as c1, r2.startcity as c2, r3.startcity as c3, r4.startcity as c4, r4.endcity as c5, (r1.distance + r2.distance + r3.distance + r4.distance) AS total_distance
      FROM (SELECT * FROM routes WHERE distance >= 250) r1 JOIN (SELECT * FROM routes WHERE distance >= 250) r2 ON r1.endcity = r2.startcity
          JOIN (SELECT * FROM routes WHERE distance >= 250) r3 ON r2.endcity = r3.startcity
          JOIN (SELECT * FROM routes WHERE distance >= 250) r4 ON r3.endcity = r4.startcity, temp
      WHERE r1.startcity = temp.sourceid AND r4.endcity = temp.targetid
          AND r2.endcity NOT IN (r1.startcity, r2.startcity)
          AND r3.endcity NOT IN (r1.startcity, r2.startcity, r3.startcity)
          AND r4.endcity NOT IN (r1.startcity, r2.startcity, r3.startcity, r4.startcity)
  ORDER BY total_distance
  LIMIT 20)
SELECT c1.name as city1, c1.state as state1, c2.name as city2, c2.state as state2, c3.name as city3, c3.state as state3, c4.name as city4, c4.state as state4, c5.name as city5, c5.state as state5, outertemp.total_distance
FROM CityInfo c1, CityInfo c2, CityInfo c3, CityInfo c4, CityInfo c5, outertemp
WHERE c1.id = outertemp.c1 AND c2.id = outertemp.c2 AND c3.id = outertemp.c3 AND c4.id = outertemp.c4 AND c5.id = outertemp.c5;`, (err, data) => {
         if (err) {
             console.log(err);
             res.json({});
         } else {
            console.log(data.rows);
           res.json(data.rows);
         }
       });
  } else {
    return res.json("Please enter a valid number of intermediate routes");
  }
}

// Route 5: GET /subcategories?cityId=11901
const subcategories = async function (req, res) {
  const cityid = parseInt(req.query.cityId, 10);
  const category1 = req.query.category1 || '';
  const category2 = req.query.category2 || '';
  const category3 = req.query.category3 || '';

  connection.query(
    `SELECT DISTINCT unnest(string_to_array(a.subcategories, ', ')) AS subcategory
     FROM attractions a
     WHERE (a.categories LIKE '%${category1}%' OR a.categories LIKE '%${category2}%' OR a.categories LIKE '%${category3}%') AND a.cityid = ${cityid};`,
    [],
    (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (data.rows.length === 0) {
        return res.json([]);
      }
      const subs = data.rows.map(row => row.subcategory);
      res.json(subs);
    }
  );
}

// Route 6: GET /numSubcategories?cityId=11901
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

// Route 7: GET /cityrecs?cityId=11901
const cityRecs = async function(req, res) {
  const id = parseInt(req.query.cityId, 10);
  connection.query(
    `SELECT closeCity FROM (
       (SELECT endCity as closeCity, Routes.distance as distance
        FROM Routes JOIN CityInfo ON CityInfo.id = Routes.startCity
        WHERE CityInfo.id = ${id})
       UNION
       (SELECT startCity as closeCity, Routes.distance as distance
        FROM Routes JOIN CityInfo ON CityInfo.id = Routes.endCity
        WHERE CityInfo.id = ${id})
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

// Route 9: GET /cityrankbyattractions?cityIds=11901,688,8485,...
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
       FROM CityInfo c
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

// Route 10: GET /randomAttraction?cityId=11901
const randomAttraction = async function(req, res) {
  const cityId = req.query.cityId;
  // const attractionIds = req.query.attractionIds; 
  // const attractionIdsArray = attractionIds.split(',').map(id => id.toString()).filter(Boolean);
  // if (attractionIdsArray.length === 0) {
  //   return res.json([]);
  // }

  // connection.query(
  //   `WITH temp as (
  //     SELECT *
  //     FROM attractions
  //     WHERE id <> ANY($1)
  //   )
  //   SELECT t.name, t.address, t.latitude, t.longitude, t.rating, t.subcategories, c.name
  //   FROM temp t JOIN CityInfo c on t.cityid = c.id
  //   WHERE c.id = ${cityId}
  //   ORDER BY RANDOM()
  //   LIMIT 1`,
  //   [attractionIdsArray],
  //   (err, data) => {
  //     if (err) {
  //       console.error(err);
  //       return res.status(500).json({ error: 'Database error' });
  //     }
  //     res.json(data.rows[0]);
  //   }
  // );
  // if (!attractionIds) {
  //   return res.status(400).json({ error: 'attractionids query param required' });
  // }

  // WITH temp as (
  //   SELECT *
  //   FROM attractions
  //   WHERE id NOT IN ('${attractionIds}')
  // )
  // SELECT t.name, t.address, t.latitude, t.longitude, t.rating, t.subcategories, c.name
  // FROM temp t JOIN CityInfo c on t.cityid = c.id
  // WHERE c.id = ${cityId}
  // ORDER BY RANDOM()
  // LIMIT 1
  

  connection.query(
    `SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.subcategories
    FROM attractions a JOIN CityInfo c on a.cityid = c.id
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

// Route 10: GET /backupAttractions?cityId=11901
const backupAttractions = async function(req, res) {
  const cityId = parseInt(req.query.cityId,10);
  if (!cityId) {
    return res.status(400).json({ error: 'cityId query param required' });

  }
  // Note: This route appears incomplete and references attractionIds, but doesn't use them.
  // We'll leave it as is.
  connection.query(
    `(SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.categories, a.subcategories, a.city, a.state
      FROM attractionsbackup a JOIN (SELECT state FROM CityInfo WHERE id = ${cityId}) t ON a.state = t.state
      ORDER BY rating DESC
      LIMIT 10)
      UNION
      (SELECT a.name, a.address, a.latitude, a.longitude, a.rating, a.categories, a.subcategories, c.name, c.state
       FROM attractions a JOIN CityInfo c ON a.cityid = c.id JOIN (SELECT state FROM CityInfo WHERE id = ${cityId}) t on c.state = t.state
      ORDER BY rating DESC
      LIMIT 10)`,
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

// Route 11: GET /cityNumRoutesAndAvgDist?cityId=11901
// This query returns how many cities this city connects to as a source and the average distance
// of these pairwise routes
const cityNumRoutesAndAvgDist = async function(req, res) {
  const cityId = parseInt(req.query.cityId,10);
  if (!cityId) {
    return res.status(400).json({ error: 'cityId query param required' });

  }
  connection.query(
    `SELECT COUNT(DISTINCT r.endCity) as numRoutes, AVG(r.distance) as avg_distance
    FROM CityInfo c JOIN Routes r on c.id = r.startcity
    WHERE c.id = ${cityId}`,
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

// Route 12: GET /subattractions?cityId=19511&subcategory1=Food&subcategory2=...
const route_subattractions = async function (req, res) {
  const id = parseInt(req.query.cityId, 10);
  const subcategory1 = req.query.subcategory1;
  const subcategory2 = req.query.subcategory2;
  const subcategory3 = req.query.subcategory3;

  connection.query(
  `SELECT DISTINCT a.name as attraction, a.address as address, a.latitude, a.longitude, a.rating, a.categories, a.subcategories
  FROM Attractions a
  WHERE (a.subcategories LIKE '%${subcategory1}%' OR a.subcategories LIKE '%${subcategory2}%' OR a.subcategories LIKE '%${subcategory3}%') AND a.cityId = ${id}
  ORDER BY a.rating desc
  LIMIT 10;`, (err, data) => {
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
  routesByAttractions, 
  rankCitiesByUniqueAttractions,
  testRoute,
  backupAttractions,
  randomAttraction,
  cityNumRoutesAndAvgDist,
  route_subattractions
};

