CREATE DATABASE basicwars;
\c basicwars
CREATE TABLE games(
	id SERIAL PRIMARY KEY,
	title VARCHAR(15),
	p1_id INTEGER,
	p2_id INTEGER,
	map_id INTEGER,
	p1_units INTEGER[],
	p2_units INTEGER[]
);

CREATE TABLE unitTypes(
	id SERIAL PRIMARY KEY,
	title VARCHAR(15),
	blurb VARCHAR (250),
	armor INTEGER,
	speed INTEGER,
	flying BOOLEAN,
	infantry BOOLEAN,
	minrange INTEGER,
	maxrange INTEGER,
	sightrange INTEGER
);

CREATE TABLE units(
	id SERIAL PRIMARY KEY,
	type_id INTEGER,
	game_id INTEGER,
	player_id INTEGER,
	pos_x INTEGER,
	pos_y INTEGER,
	cur_hp INTEGER,
	capturing BOOLEAN,
	capture_prog INTEGER
);


