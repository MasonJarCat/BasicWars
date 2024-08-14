const pg = require("pg");
const express = require("express");
const path = require('path');

const app = express();

// Use environment variables for port and hostname
const port = process.env.PORT || 3000;
const hostname = process.env.HOST || '0.0.0.0';

// Configure database connection using environment variables
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, 
});

pool.connect()
  .then(() => console.log(`Connected to database ${process.env.DB_NAME}`))
  .catch(err => console.error('Database connection error:', err));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

/* Routes */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/gamelist", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gamelist.html'));
});

app.get("/gamescreen", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'gamescreen.html'));
});

app.get("/gamescreen/:spritename", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'sprites', req.params.spritename));
});

app.get("/terraintypes", (req, res) => {
  let text = "SELECT * FROM terrainTypes";
  pool.query(text).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json({ "rows": result.rows });
  }).catch(err => res.status(500).json({ error: err.message }));
});

app.get("/unittypes", (req, res) => {
  let text = "SELECT * FROM unitTypes";
  pool.query(text).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json({ "rows": result.rows });
  }).catch(err => res.status(500).json({ error: err.message }));
});

app.get("/gameunits", (req, res) => {
  let gameid = req.query.gameid; 
  let text = "SELECT * FROM units WHERE game_id = $1";
  pool.query(text, [gameid]).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json({"rows": result.rows });
  }).catch(err => res.status(500).json({ error: err.message }));
});

app.post("/add/game", (req, res) => {
  let { title, p1_id, p2_id, map_id } = req.body;
  
  if (!title || !p1_id || !p2_id || !map_id) {
    return res.sendStatus(400);
  }

  let p1_units = [];
  let p2_units = [];
  let text = "INSERT INTO games(title, p1_id, p2_id, map_id, p1_units, p2_units) VALUES($1, $2, $3, $4, $5, $6) RETURNING id";
  let values = [title, parseInt(p1_id), parseInt(p2_id), parseInt(map_id), p1_units, p2_units];

  if (title.length > 25 || values.some(value => Number.isNaN(value))) {
    return res.sendStatus(400);
  }
  
  pool.query(text, values).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(result.rows[0]);
  }).catch(err => res.status(500).json({ error: err.message }));
});

app.post("/add/unit", (req, res) => {
    let { type_id, game_id, player_id, pos_x, pos_y, isP1 } = req.body;
  
  if (!type_id || !game_id || !player_id || pos_x === undefined || pos_y === undefined) {
    return res.sendStatus(400);
  }

  let text = "INSERT INTO unit(type_id, game_id, player_id, pos_x, pos_y, cur_hp, capturing, capture_prog) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id";
  let values = [parseInt(type_id), parseInt(game_id), parseInt(player_id), pos_x, pos_y, 100, false, 20];
  
  pool.query(text, values).then(result => {
    let unit_id = result.rows[0].id;
    
    let unitsQuery = isP1 ? 
      `UPDATE games SET p1_units = array_append(p1_units, $1) WHERE id = $2` : 
      `UPDATE games SET p2_units = array_append(p2_units, $1) WHERE id = $2`;

    return pool.query(unitsQuery, [unit_id, game_id]).then(() => {
      res.setHeader('Content-Type', 'application/json');
      return res.json({ unit_id });
    });
  }).catch(err => res.status(500).json({ error: err.message }));
});

app.post("/add/map", (req, res) => {
    let { title, height, width, terrain } = req.body;
  
  if (!title || !height || !width || !terrain) {
    return res.sendStatus(400);
  }

  const text = "INSERT INTO map(title, height, width, terrain) VALUES($1, $2, $3, $4) RETURNING id";
  const values = [title, parseInt(height), parseInt(width), terrain];

  if (title.length > 25 || values.some(value => Number.isNaN(value))) {
    return res.sendStatus(400);
  }

  pool.query(text, values).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(result.rows[0]);
  }).catch(err => res.status(500).json({ error: err.message }));
});

// Get all games
app.get("/games", (req, res) => {
  const query = "SELECT * FROM games";

  pool.query(query)
    .then(result => res.json({ rows: result.rows }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get a specific game by ID
app.get("/game", (req, res) => {
  console.log(req.body);
  let gameid = req.query.gameid;
  console.log(gameid);
  if (!gameid) {
    return res.status(400).json({ error: 'Missing game ID' });
  }

  const query = "SELECT * FROM games WHERE id = $1";
  
  pool.query(query, [gameid])
    .then(result => res.json({ rows: result.rows }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get a specific map by ID
app.get("/map", (req, res) => {
  console.log(req.body);
  const mapid = req.query.mapid;
  console.log(mapid);
  if (!mapid) {
    return res.status(400).json({ error: 'Missing map ID' });
  }

  const query = "SELECT * FROM maps WHERE id = $1";
  
  pool.query(query, [mapid])
    .then(result => res.json({ rows: result.rows }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Add a new user
app.post("/add/user", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = "INSERT INTO users(username, password) VALUES($1, $2) RETURNING id";
  const values = [username, password];

  pool.query(query, values)
    .then(result => res.json({ id: result.rows[0].id }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }
  
    const query = "SELECT * FROM users WHERE username = $1 AND pword = $2";
    const values = [username, password];
  
    pool.query(query, values)
      .then(result => {
        if (result.rows.length > 0) {
          //add cookies
          res.status(200).json({ message: 'Login successful' });
        } else {
          res.status(401).json({ error: 'Invalid username or password' });
        }
      })
      .catch(err => res.status(500).json({ error: err.message }));
  });
   // add logout function

// Start the server
app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
