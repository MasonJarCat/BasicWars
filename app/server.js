const pg = require("pg");
const express = require("express");
const path = require('path');
let  cookieParser = require("cookie-parser");
const app = express();
const { v4: uuidv4 } = require('uuid'); // UUID package to generate unique session IDs
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
  
/*const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});*/

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

const authenticateUser = async (req, res, next) => {
  const sessionId = req.cookies.session;

  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized: No session found' });
  }

  try {
    const query = "SELECT * FROM activeUsers WHERE cookie = $1";
    const values = [sessionId];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      req.player_id = result.rows[0].player_id;
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized: Invalid session' });
    }
  } catch (error) {
    console.error('Error validating session:', error.message);
    res.status(500).json({ error: 'Failed to validate session' });
  }
};
// Serve static files
app.get('/resetTestGames', authenticateUser, async (req, res) => {
  try {
    const currentPlayerId = req.player_id;

    // Ensure that only specific users can reset test games (optional)
    const allowedUserIds = [1,2]; // Replace with the actual IDs of allowed users
    if (!allowedUserIds.includes(currentPlayerId)) {
      return res.status(403).json({ error: 'Forbidden: You are not allowed to reset test games' });
    }
    const deleteUnitsQuery = `
      DELETE FROM units
      WHERE game_id IN (
      SELECT id FROM games
      WHERE title IN ('testgame1', 'testgame2')
      )
    `;

    await pool.query(deleteUnitsQuery);
    const resetQuery1 = `
      UPDATE games
      SET
          p1_units = '{}',
          p2_units = '{}',
          starter_income = 10,
          p1_funds = 10,
          p2_funds = 10,
          p1_income = 10,
          p2_income = 10,
          tile_owners = '{{1, 1, 0},{0, 0, 0},{0, 2, 2}}',
          fog = 'false',
          turn = 0
      WHERE title = 'testgame1';
    `;

    const resetQuery2 = `
      UPDATE games
      SET
          p1_units = '{}',
          p2_units = '{}',
          starter_income = 10,
          p1_funds = 10,
          p2_funds = 10,
          p1_income = 10,
          p2_income = 10,
          tile_owners = '{{1, 1, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 2, 2}}',
          fog = 'true',
          turn = 1
      WHERE title = 'testgame2';
    `;

    await pool.query(resetQuery1);
    await pool.query(resetQuery2);

    res.status(200).json({ message: 'Test games reset to their original states successfully.' });
  } catch (error) {
    console.error('Error resetting test games:', error.message);
    res.status(500).json({ error: 'Failed to reset test games.' });
  }
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

app.get("/winscreen", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'winscreen.html'));
});

app.get("/creategame", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'creategame.html'));
});

app.get("/settings", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get("/lobby", (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'lobby.html'));
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

//Fitz's create game & lobby queries start here

app.get("/maps", (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const query = "SELECT * FROM maps";
  
  pool.query(query)
    .then(result => {
      res.json({ rows: result.rows });}
  )
    .catch(err => res.status(500).json({ error: err.message }));
})

app.get("/userssafely", (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const query = "SELECT id, username, fav_commander FROM users";
  
  pool.query(query)
    .then(result => {
      res.json({ rows: result.rows });}
  )
    .catch(err => res.status(500).json({ error: err.message }));
})

app.post("/add/game", (req, res) => {
  let { title, p1_id, p2_id, map_id, starter_income, starter_funds, tile_owners, fog, p1_commander, p2_commander } = req.body;
  
  if (!title || !p1_id || p2_id === "" || !map_id || !starter_income || !starter_funds || !tile_owners || (fog == undefined) || !p1_commander || p2_commander == NaN) {
    return res.sendStatus(400);
  }

  let p1_units = [];
  let p2_units = [];
  let p1_income = parseInt(starter_income);
  let p2_income = parseInt(starter_income);
  let p1_funds = parseInt(starter_funds);
  let p2_funds = parseInt(starter_funds);
  let text = "INSERT INTO games(title, p1_id, p2_id, map_id, p1_units, p2_units, starter_income, p1_funds, p2_funds, p1_income, p2_income, tile_owners, fog, turn, p1_commander, p2_commander) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id";
  let values = [title, parseInt(p1_id), parseInt(p2_id), parseInt(map_id), p1_units, p2_units, parseInt(starter_income), p1_funds, p2_funds, p1_income, p2_income, tile_owners, fog, 1, parseInt(p1_commander), parseInt(p2_commander)];

  if (title.length > 25 || values.some(value => Number.isNaN(value))) {
    return res.sendStatus(400);
  }
  
  pool.query(text, values).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(result.rows[0]);
  }).catch(err => {
    console.log(err);
    res.status(500).json({ error: err.message });});
});

app.get("/opengames", (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  let userId = req.query.userId;

  const query = "SELECT * FROM games WHERE p2_id = $1 AND p1_id != $2";
  const values = [0, parseInt(userId)];
  
  pool.query(query, values)
    .then(result => {
      res.json({ rows: result.rows });}
  )
    .catch(err => res.status(500).json({ error: err.message }));
});

app.post("/joingame", (req, res) => {
  let userId = parseInt(req.body.userId); 
  let gameId = parseInt(req.body.gameId); 
  if (userId == NaN || gameId == NaN){
    return res.sendStatus(400);
  }

  const text = "UPDATE games SET p2_id = $1 WHERE id = $2";

  const values = [userId, gameId];

  pool.query(text, values).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(result.rows[0]);
  }).catch(err => {
    console.log(err);
    res.status(500).json({ error: err.message });});

});

app.post("/finishgame", (req, res) => {
  let gameId = req.body.gameId; 
  console.log(gameId);

  if (gameId == NaN || gameId == undefined){
    console.log("id not found");
    return res.sendStatus(400);
  }

  const text = "DELETE FROM games WHERE id = $1";
  const values = [gameId];

  pool.query(text, values).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(result.rows[0]);
  }).catch(err => {
    console.log(err);
    res.status(500).json({ error: err.message });});
  
});

app.post("/setcommander", (req, res) => {
  let userId = req.body.userId;
  let commanderId = req.body.commanderId; 
  console.log (userId);
  console.log(commanderId);

  if (userId == NaN || userId == undefined || commanderId == NaN || commanderId == undefined){
    console.log("id not found");
    return res.sendStatus(400);
  }

  const text = "UPDATE users SET fav_commander = $1 WHERE id = $2";
  const values = [commanderId, userId];

  pool.query(text, values).then(result => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(result.rows[0]);
  }).catch(err => {
    console.log(err);
    res.status(500).json({ error: err.message });});

})


//Fitz's add game & lobby queries end here

app.post("/add/unit", (req, res) => {
  let { type_id, game_id, player_id, pos_x, pos_y, isP1 } = req.body;

  // Basic validation check
  if (!type_id || !game_id || !player_id || pos_x === undefined || pos_y === undefined) {
      console.error("Missing required parameters.");
      return res.sendStatus(400);
  }

  // Insert unit into the unit table
  let text = `
      INSERT INTO units(type_id, game_id, player_id, pos_x, pos_y, cur_hp, capturing, capture_prog) 
      VALUES($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id
  `;
  let values = [parseInt(type_id), parseInt(game_id), parseInt(player_id), parseInt(pos_x), parseInt(pos_y), 10, false, 0];

  console.log("Executing query:", text, values);

  pool.query(text, values).then(result => {
      let unit_id = result.rows[0].id;
      console.log("Unit created with ID:", unit_id);

      let unitsQuery = isP1 ? 
          `UPDATE games SET p1_units = array_append(p1_units, $1) WHERE id = $2` : 
          `UPDATE games SET p2_units = array_append(p2_units, $1) WHERE id = $2`;

      console.log("Updating games table with query:", unitsQuery);

      return pool.query(unitsQuery, [unit_id, game_id]).then(() => {
          res.setHeader('Content-Type', 'application/json');
          return res.json({ unit_id });
      });
  }).catch(err => {
      console.error("Error executing query:", err.message);
      return res.status(500).json({ error: err.message });
  });
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
app.post("/update/unit", (req, res) => {
  const { unit_id, cur_hp, capturing, capture_prog, can_capture_this_turn, can_move_this_turn, can_attack_this_turn, pos_x, pos_y } = req.body;

  // Basic validation check
  if (!unit_id || cur_hp === undefined || capturing === undefined || capture_prog === undefined || can_capture_this_turn === undefined || can_move_this_turn === undefined || can_attack_this_turn === undefined || pos_x === undefined || pos_y === undefined) {
    console.error("Missing required parameters.");
    return res.sendStatus(400);
  }

  // Update unit stats and position in the unit table
  const text = `
    UPDATE units
    SET cur_hp = $1, capturing = $2, capture_prog = $3, can_capture_this_turn = $4, can_move_this_turn = $5, can_attack_this_turn = $6, pos_x = $7, pos_y = $8
    WHERE id = $9
  `;
  const values = [cur_hp, capturing, capture_prog, can_capture_this_turn, can_move_this_turn, can_attack_this_turn, pos_x, pos_y, unit_id];

  console.log("Executing query:", text, values);

  pool.query(text, values)
    .then(() => {
      res.status(200).json({ message: 'Unit stats and position updated successfully' });
    })
    .catch(err => {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: err.message });
    });
});
app.post('/updateGameState', authenticateUser, async (req, res) => {
  const { p1_units, p2_units, p1_funds, p2_funds, p1_income, p2_income, tile_owners, fog, turn } = req.body;
  const gameId = req.query.gameid;
  try {
    // Fetch the game state to determine whose turn it is
    const gameQuery = "SELECT * FROM games WHERE id = $1";
    const gameResult = await pool.query(gameQuery, [gameId]);

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const gameData = gameResult.rows[0];
    const isPlayer1Turn = gameData.turn % 2 === 1;
    const currentPlayerId = req.player_id;
    console.log(`player id ${currentPlayerId}`);
    // Ensure the player is allowed to make a move
    if ((isPlayer1Turn && currentPlayerId !== gameData.p1_id) || (!isPlayer1Turn && currentPlayerId !== gameData.p2_id)) {
      return res.status(403).json({ error: 'Not your turn' });
    }
    const updateUnitsQuery = `
      UPDATE units
      SET can_capture_this_turn = true, can_move_this_turn = true, can_attack_this_turn = true
      WHERE game_id = $1
    `;
    console.log(`p1 units ${p1_units},p2 units ${p2_units}`)
    await pool.query(updateUnitsQuery, [gameId]);
    // Update the game state in the database
    const query = `
        UPDATE games
        SET
            p1_units = $1,
            p2_units = $2,
            p1_funds = $3,
            p2_funds = $4,
            p1_income = $5,
            p2_income = $6,
            tile_owners = $7,
            fog = $8,
            turn = $9
        WHERE id = $10
    `;

    const values = [p1_units, p2_units, p1_funds, p2_funds, p1_income, p2_income, tile_owners, fog, turn, gameId];
    await pool.query(query, values);

    res.status(200).json({ message: 'Game state updated successfully' });
  } catch (error) {
    console.error('Error updating game state:', error.message);
    res.status(500).json({ error: 'Failed to update game state' });
  }
});

// Get all games according to a given user id
app.get("/games", (req, res) => {
  let userId = req.query.userId;
  console.log(userId);
  const query = "SELECT * FROM games WHERE (p1_id = $1 AND p2_id != $2) OR p2_id = $1";
  const values = [parseInt(userId), 0];

  //const query = "SELECT * FROM games";
  console.log(query);

  pool.query(query, values)
    .then(result => {
      console.log(result.rows);
      res.json({ rows: result.rows });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Get a specific game by ID
app.get("/game", (req, res) => {
  let gameid = req.query.gameid;
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

  const query = "INSERT INTO users(username, password, fav_commander) VALUES($1, $2, $3) RETURNING id";
  const values = [username, password, 1];

  pool.query(query, values)
    .then(result => res.json({ id: result.rows[0].id }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

app.get("/username/:id", (req,res) => {
  res.setHeader('Content-Type', 'application/json');
  id = req.params['id'];
  const query = "SELECT username FROM users WHERE id = $1";
  const values = [parseInt(id)];

  pool.query(query, values)
    .then(result => {
      if (result.rows.length > 0) {
        const username = result.rows[0].username;
        res.json({ username });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get("/loginPage", (req,res) => {
  // Serve the login.html page
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
})

app.get("/terminalbackdrop.png", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terminalbackdrop.png'));
})
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
        const user = result.rows[0];
        const sessionId = uuidv4(); // Generate a unique session ID

        // Insert the session ID into the activeUsers table
        const insertQuery = "INSERT INTO activeUsers (cookie, player_id) VALUES ($1, $2)";
        const insertValues = [sessionId, user.id];

        pool.query(insertQuery, insertValues)
          .then(() => {
            // Set the session cookie in the response
            const cookieOptions = { httpOnly: true, secure: true,sameSite: "strict", maxAge: 60 * 60 * 1000 };
            res.cookie('session', sessionId, cookieOptions);
            res.cookie('userId', user.id, {secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
            res.status(200).json({ message: 'Login successful' });
          })
          .catch(err => res.status(500).json({ error: 'Failed to create session' }));
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
});
app.get("/signupPage", (req, res) => {
  // Serve the signup.html page
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
   // add logout function
app.post("/signup", (req,res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Check if username or email already exists in the database
  const checkQuery = "SELECT * FROM users WHERE username = $1 OR email = $2";
  const checkValues = [username, email];

  pool.query(checkQuery, checkValues)
    .then(result => {
      if (result.rows.length > 0) {
        // User with the same username or email already exists
        return res.status(409).json({ error: 'Username or email already exists' });
      } else {
        // Insert the new user into the database
        const insertQuery = "INSERT INTO users(username, email, pword) VALUES($1, $2, $3) RETURNING id";
        const insertValues = [username, email, password];

        pool.query(insertQuery, insertValues)
          .then(result => res.json({ id: result.rows[0].id }))
          .catch(err => res.status(500).json({ error: err.message }));
      }
    })
    .catch(err => res.status(500).json({ error: err.message }));
})

// Start the server
app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
