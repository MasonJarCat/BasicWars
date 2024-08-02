/*TODO write document for what is require for each api call */
const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";
const path = require('path');

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json());

app.get("/test", (req,res) => {
  res.sendFile(`C:\\Users\\bigbu\\code\\basic\\BasicWars\\app\\public\\test.html`)
})
/*ADD Routes*/

app.get("/", (req, res) =>{
  res.sendFile("public\\index.html", {root: __dirname});
})

app.get("/gamelist", (req, res) =>{
  res.sendFile("public\\gamelist.html", {root: __dirname});
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
    return
});

/* not done */
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
    /*add unit_id to coresponding map title */ 
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
/* Get data routes*/
/*app.get("/data/gameState")*/

app.get("/games", (req, res) => {
  let text = "SELECT * FROM games";
  pool.query(text).then(result => {
    res.setHeader('Content-Type', 'application/json');
    console.log(result.rows);
    return res.json({"rows": result.rows});
  });
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
