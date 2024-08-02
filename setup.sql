CREATE DATABASE basicwars;
\c basicwars

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	username VARCHAR(25),
	pword VARCHAR(25),
	email VARCHAR(256)
);

CREATE TABLE games(
	id SERIAL PRIMARY KEY,
	title VARCHAR(25),
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
	vehicle BOOLEAN,
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
	vehicleAccess BOOLEAN,
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
	terrain INTEGER[][]
);

INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('hq', 4, 1, 'true', 'true', 'true', 'true', 'true', 'false', '{}');
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('plains', 1, 1, 'false', 'true', 'true', 'false', 'false', 'false', '{}');
INSERT INTO maps (title, width, height, terrain)
VALUES('testmap1', 3, 3, '{{0, 1, 1},{1, 1, 1},{1, 1, 0}}');
INSERT INTO users (username, pword, email)
VALUES('jfitz', 'pword1234', 'jf879@drexel.edu');
INSERT INTO users (username, pword, email)
VALUES('mason', '4321drowp', 'mcm542@drexel.edu');
INSERT INTO games (title, p1_id, p2_id, map_id, p1_units, p2_units)
VALUES('testgame1', 0, 1, 0, '{}', '{}');



