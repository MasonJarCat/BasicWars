const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json());

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
    let text = "INSERT INTO games(title,p1_id,p2_id,map_id,p1_units,p2_units) VALUES($1, $2,$3,$4,$5,$6)";
    let values = [title,p1_id,p2_id,map_id,p1_units,p2_units];
    if(title.length > 15 ){
      return res.sendStatus(400);
    }
    if(Number.isNaN(p1_id) || Number.isNaN(p2_id) || Number.isNaN(map_id)){
      return res.sendStatus(400);
    }
    pool.query(text,values);
});

app.post("/add/unit", (req,res) => {
  if(!(req.body.hasOwnProperty("type_id") && req.body.hasOwnProperty("game_id") && req.body.hasOwnProperty("player_id") && req.body.hasOwnProperty("pos_x")&& req.body.hasOwnProperty("pos_y") 
    && req.body.hasOwnProperty("player_id") && req.body.hasOwnProperty("map_id"))){
    return res.sendStatus(400);
  }

    let type_id = parseInt(req.body.p1_id);
    let game_id = parseInt(req.body.p2_id);
    let player_id = parseInt(req.body.map_id);
    let pos_x = [];
    let pos_y = [];
    let cur_hp;
    let capturing;
    let capture_prog;
    let text = "INSERT INTO games(title,p1_id,p2_id,map_id,p1_units,p2_units) VALUES($1, $2,$3,$4,$5,$6)";
    let values = [title,p1_id,p2_id,map_id,p1_units,p2_units];
    if(title.length > 15 ){
      return res.sendStatus(400);
    }
    if(Number.isNaN(p1_id) || Number.isNaN(p2_id) || Number.isNaN(map_id)){
      return res.sendStatus(400);
    }
    pool.query(text,values);
});
app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
