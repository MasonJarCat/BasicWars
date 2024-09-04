DROP DATABASE basicwars;
CREATE DATABASE basicwars;
\c basicwars

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	username VARCHAR(25),
	pword VARCHAR(128),
	email VARCHAR(256)
);

CREATE TABLE games(
	id SERIAL PRIMARY KEY,
	title VARCHAR(25),
	p1_id INTEGER,
	p2_id INTEGER,
	map_id INTEGER,
	p1_units INTEGER[],
	p2_units INTEGER[],
	starter_income INTEGER,
	p1_funds INTEGER,
	p2_funds INTEGER,
	p1_income INTEGER,
	p2_income INTEGER,
	tile_owners INTEGER[][],
	fog BOOLEAN,
	turn INTEGER
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
	sightrange INTEGER,
	cost INTEGER
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
	capture_prog INTEGER,
	can_move_this_turn BOOLEAN,
	can_attack_this_turn BOOLEAN,
	can_capture_this_turn BOOLEAN
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
	terrain INTEGER[][],
	cellOwner INTEGER[][]
);

CREATE TABLE activeUsers(
	id SERIAL PRIMARY KEY,
	cookie VARCHAR(128),
	player_id INTEGER
);

INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('infantry', 'Basic infantry unit', 0, 3, 'false', 'true', 'false', 'false', 0, 1, 2, 10);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('mechinfantry', 'Heavier infantry unit with rocket launchers', 1, 3, 'false', 'true', 'false', 'false', 0, 1, 2, 30);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('recon', 'Light recon vehicle', 1, 7, 'false', 'false', 'true', 'false', 0, 1, 5, 50);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('lighttank', 'light tank', 3, 5, 'false', 'false', 'true', 'false', 0, 1, 2, 70);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('heavytank', 'heavy tank that kills things real good', 6, 5, 'false', 'false', 'true', 'false', 0, 1, 1, 150);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('artillery', 'ranged artillery, cannot engage at melee range', 1, 4, 'false', 'false', 'true', 'false', 1, 3, 1, 60);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('rocketarty', 'rocket artillery with even further range', 1, 4, 'false', 'false', 'true', 'false', 2, 5, 1, 120);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('antiair', 'dedicated anti-aircraft gun', 1, 5, 'false', 'false', 'true', 'false', 0, 1, 3, 70);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('helicopter', 'attack helicopter', 2, 5, 'true', 'false', 'false', 'false', 0, 1, 4, 90);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('fighter', 'A fighter jet, great against other aircraft', 2, 9, 'true', 'false', 'false', 'false', 0, 1, 3, 180);
INSERT INTO unitTypes(title, blurb, armor, speed, flying, infantry, vehicle, naval, minrange, maxrange, sightrange, cost)
VALUES('bomber', 'bomber aircraft that can devastate ground units', 2, 7, 'true', 'false', 'false', 'false', 0, 1, 1, 200);
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('hq', 4, 1, 'true', 'true', 'true', 'true', 'true', 'false', '{}');
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('factory', 4, 1, 'true', 'true', 'true', 'true', 'true', 'true', '{1, 2, 3, 4, 5, 6, 7, 8}');
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('plains', 1, 1, 'false', 'true', 'true', 'false', 'false', 'false', '{}');
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('settlement', 3, 1, 'true', 'true', 'true', 'false', 'false', 'false', '{}');
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('airport', 3, 1, 'true', 'true', 'true', 'false', 'false', 'true', '{9, 10, 11}');
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('mountain', 4, 1, 'false', 'false', 'true', 'false', 'false', 'false', '{}');
INSERT INTO terrainTypes (title, cover, moveCost, capturable, vehicleAccess, groundAccess, seaAccess, hiding, canPrintUnits, unitPrintList)
VALUES('forest', 2, 1, 'false', 'true', 'true', 'false', 'false', 'false', '{}');
INSERT INTO maps (title, width, height, terrain, cellOwner) 
VALUES('testmap1', 3, 3, '{{1, 2, 3},{3, 3, 3},{3, 2, 1}}', '{{1, 1, 0},{0, 0, 0},{0, 2, 2}}');
INSERT INTO maps (title, width, height, terrain, cellOwner) 
VALUES('testmap2', 5, 5, '{{1, 2, 3, 3, 3},{3, 3, 3, 3, 3},{4, 3, 4, 3, 4},{3, 3, 3, 3, 3},{3, 3, 3, 2, 1}}', '{{1, 1, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 2, 2}}');
INSERT INTO maps (title, width, height, terrain, cellOwner) 
VALUES('bigmap', 25, 20, '{{1, 2, 3, 3, 4, 5, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3},
{3, 2, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 4, 3, 4},
{3, 3, 3, 3, 6, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 6, 4, 3, 3, 7, 4, 7, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 7, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6},
{7, 7, 6, 3, 3, 3, 4, 3, 3, 3, 3, 6, 2, 6, 3, 3, 3, 3, 4, 3, 3, 3, 6, 7, 7},
{6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 7, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 7, 4, 7, 3, 3, 4, 6, 3, 3, 3},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 3, 3, 3, 6, 3, 3, 3, 3},
{4, 3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 2, 3},
{3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 5, 4, 3, 3, 2, 1}}', 
'{{1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1}}');
INSERT INTO maps (title, width, height, terrain, cellOwner) 
VALUES('longsrevenge', 12, 12, 
'{{6, 2, 4, 3, 4, 3, 3, 7, 3, 4, 3, 4},
{2, 5, 3, 6, 3, 3, 3, 3, 3, 3, 7, 3},
{4, 3, 4, 3, 3, 7, 3, 3, 3, 4, 3, 4},
{3, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
{4, 3, 3, 3, 1, 3, 3, 4, 3, 3, 3, 7},
{3, 3, 7, 3, 3, 2, 6, 3, 3, 3, 3, 3},
{3, 3, 3, 3, 3, 6, 2, 3, 3, 7, 3, 3},
{7, 3, 3, 3, 4, 3, 3, 1, 3, 3, 3, 4},
{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 3},
{4, 3, 4, 3, 3, 3, 7, 3, 3, 4, 3, 4},
{3, 7, 3, 3, 3, 3, 3, 3, 6, 3, 5, 2},
{4, 3, 4, 3, 7, 3, 3, 4, 3, 4, 2, 6}}', 
'{{0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2},
{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0}}');
INSERT INTO games (title, p1_id, p2_id, map_id, p1_units, p2_units, starter_income, p1_funds, p2_funds, p1_income, p2_income, tile_owners, fog) 
VALUES('testgame1', 1, 2, 1, '{}', '{}', 10, 10, 10, 10, 10, '{{1, 1, 0},{0, 0, 0},{0, 2, 2}}', 'false');
INSERT INTO games (title, p1_id, p2_id, map_id, p1_units, p2_units, starter_income, p1_funds, p2_funds, p1_income, p2_income, tile_owners, fog) 
VALUES('testgame2', 1, 2, 2, '{}', '{}', 10, 10, 10, 10, 10, '{{1, 1, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 0, 0},{0, 0, 0, 2, 2}}', 'true');



