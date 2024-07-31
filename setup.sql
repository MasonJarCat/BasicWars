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
	armor BOOLEAN,
	naval BOOLEAN,
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

CREATE TABLE terrainTypes(
	id SERIAL PRIMARY KEY,
	title VARCHAR(15),
	cover INTEGER,
	moveCost INTEGER,
	capturable BOOLEAN,
	armorAccess BOOLEAN,
	groundAccess BOOLEAN,
	seaAccess BOOLEAN,
	hiding BOOLEAN,
	canPrintUnits BOOLEAN,
	unitPrintList INTEGER[]
);

CREATE TABLE maps(
	id SERIAL PRIMARY KEY,
	title VARCHAR(25),
	width INTEGER,
	height INTEGER,
	terrain INTEGER[]
)


