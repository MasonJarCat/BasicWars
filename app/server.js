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
app.get("/index.hmtl", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/gamelist", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gamelist.html'));
});

app.get("/gamescreen", (req, res) =>{
  res.sendFile("public\\gamescreen.html", {root: __dirname});
})

app.get("/gamescreen/:spritename", (req, res) =>{
  res.sendFile("public\\sprites\\" + req.params.spritename, {root: __dirname});
});

app.get("/terraintypes", (req, res) => {
  let text = "SELECT * FROM terrainTypes";
  pool.query(text).then(result => {
    res.setHeader('Content-Type', 'application/json');
    console.log(result.rows);
    return res.json({"rows": result.rows});
  });
});

app.get("/unittypes", (req, res) => {
  let text = "SELECT * FROM unitTypes";
  pool.query(text).then(result => {
    res.setHeader('Content-Type', 'application/json');
    console.log(result.rows);
    return res.json({"rows": result.rows});
  });
});

app.get("/gameunits", (req, res) => {
  let gameid = req.query.gameid; 
  let text = "SELECT * FROM units WHERE game_id = " + gameid;
  pool.query(text).then(result => {
    res.setHeader('Content-Type', 'application/json');
    console.log(result.rows);
    return res.json({"rows": result.rows});
  });
})


app.post("/add/game", (req,res) => {
  if(!(req.body.hasOwnProperty("title") && req.body.hasOwnProperty("p1_id") && req.body.hasOwnProperty("p2_id") && req.body.hasOwnProperty("map_id"))){
    return res.sendStatus(400);
  }
    let title = req.body.title;
    let p1_id = parseInt(req.body.p1_id);
    let p2_id = parseInt(req.body.p2_id);
    let map_id = parseInt(req.body.map_id);
    let p1_units = [];
    let p2_units = [];
    let text = "INSERT INTO games(title,p1_id,p2_id,map_id,p1_units,p2_units) VALUES($1, $2,$3,$4,$5,$6) RETURNING id";
    
    let values = [title,p1_id,p2_id,map_id,p1_units,p2_units];
    if(title.length > 25 ){
      return res.sendStatus(400);
    }
    if(Number.isNaN(p1_id) || Number.isNaN(p2_id) || Number.isNaN(map_id)){
      return res.sendStatus(400);
    }
    
    
    pool.query(text,values).then(result => {
      res.setHeader('Content-Type', 'application/json');
      res.body = result.rows;
      console.log(res.body);
      return res.json();
    });
    return;
});

app.post("/add/unit", (req,res) => {
  if(!(req.body.hasOwnProperty("type_id") && req.body.hasOwnProperty("game_id") && req.body.hasOwnProperty("player_id") && req.body.hasOwnProperty("pos_x")&& req.body.hasOwnProperty("pos_y") 
    && req.body.hasOwnProperty("player_id") && req.body.hasOwnProperty("map_id"))){
    return res.sendStatus(400);
  }
    let unit_id;
    let type_id = parseInt(req.body.p1_id);
    let game_id = parseInt(req.body.p2_id);
    let player_id = parseInt(req.body.map_id);
    let pos_x = [];
    let pos_y = [];
    let cur_hp = 100;
    let capturing = false;
    let capture_prog = 20;
    let text = "INSERT INTO unit(type_id,game_id,player_id,pos_x,pos_y,cur_hp,capturing,capture_prog) VALUES($1, $2,$3,$4,$5,$6,$7,$8) RETURNING id";
    let values = [type_id, game_id, player_id, pos_x, pos_y, cur_hp, capturing, capture_prog];
    unit_id = pool.query(text,values);
    if(req.body.isP1){
    let units = pool.query(`SELECT p1_units FROM game WHERE game.id = "game"`, [game_id]);
      units.append(unit_id);
      pool.query(`UPDATE game SET p1_units = "units" WHERE game.id = "game"`, [units,game_id]);
    }
    else{
        let units = pool.query(`SELECT p2_units FROM game WHERE game.id = "game"`, [game_id]);
        units.append(unit_id);
        pool.query(`UPDATE game SET p2_units = "units" WHERE game.id = "game"`, [units,game_id]);
    } 
});

app.post("/add/map", (req,res) => {
  if(!(req.body.hasOwnProperty("title") && req.body.hasOwnProperty("p1_id") && req.body.hasOwnProperty("p2_id") && req.body.hasOwnProperty("map_id"))){
    return res.sendStatus(400);
  }
    let title = req.body.title;
    let height = parseInt(req.body.height);
    let width = parseInt(req.body.width);
    let terrain = req.body.terrain;

    let text = "INSERT INTO map(title,height,width,terrain,) VALUES($1, $2,$3,$4) RETURNING id";
    
    let values = [title,height,width,terrain,];
    if(title.length > 25){
      return res.sendStatus(400);
    }
    if(Number.isNaN(height) || Number.isNaN(width)){
      return res.sendStatus(400);
    }
    pool.query(text,values).then(result => {
      res.setHeader('Content-Type', 'application/json');
      res.body = result.result.rows;
      return res.json();
    });
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
  const { gameid } = req.query;

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
  const { mapid } = req.query;

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
  // Implement login logic here
});

app.post("/logout", (req, res) => {
  // Implement logout logic here
});

app.post("/update/user", (req, res) => {
  // Implement user update logic here
});

// Start the server
app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
