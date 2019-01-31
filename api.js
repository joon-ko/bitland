const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');

const User = require('./models/user');

const TILE_INFO = require('./maps/tile-info.json');

// loading map
let mapArray = [];
fs.readFile(__dirname + '/maps/tutorial1', 'utf8', (err, data) => {
	if (err) console.log(err);
	let lines = data.split(/[\r\n]+/g);
	lines.forEach((line) => {
		mapArray.push(line.split(''));
	});
	console.log('map loaded.');
});

// get current tiles test player is standing on
router.get('/tile', (req, res) => {
	User.findOne({ username: req.user.username }, (err, user) => {
		const x = user.x; const y = user.y;
		res.send(TILE_INFO[mapArray[x][y]]);
	})
});

// move the test player
router.post('/move', (req, res) => {
	const { direction } = req.body;
	const query = { username: req.user.username };
	User.findOne(query, (err, user) => {
		let proposedX = user.x; let proposedY = user.y;
		switch (direction) {
			case 'up':
				proposedX -= 1;
				break;
			case 'down':
				proposedX += 1;
				break;
			case 'left':
				proposedY -= 1;
				break;
			case 'right':
				proposedY += 1;
				break;
			default:
				console.log('invalid move direction');
		}

		// determine if tile is passable, and if it's not, stop movement
		tileInfo = TILE_INFO[mapArray[proposedX][proposedY]];
		if (tileInfo.passable) {
			User.findOneAndUpdate(
				query,
				{ $set: { 'x': proposedX, 'y': proposedY } },
				{ new: true },
				(err, user) => { res.send(user); }
			);
		} else {
			// don't move!
			res.send(user);
		}
	});
});

// request the 13x13 2D array section of the map based on current position 
router.get('/map', (req, res) => {
	User.findOne({ username: req.user.username }, (err, user) => {
		if (err) console.log(err);
		const x = user.x; const y = user.y;
		// build the array
		let resArray = [];
		for (let i = x-6; i <= x+6; i++) {
			let line = [];
			for (let j = y-6; j <= y+6; j++) {
				// if out of bounds, fill with blank
				if (i < 0 || j < 0 || i >= mapArray.length || j >= mapArray[0].length) {
					line.push(TILE_INFO[' ']);
				} else if (i === x && j === y) {
					line.push(TILE_INFO['p']);
				} else {
					line.push(TILE_INFO[mapArray[i][j]]);
				}
			}
			resArray.push(line);
		}
		res.send(resArray);
	});
});

// get current inventory as a 10-element array
router.get('/inventory', (req, res) => {
	User.findOne({ username: req.user.username }, (err, user) => {
		if (err) console.log(err);
		let inventoryArray = user.inventory.map((itemSlot) => TILE_INFO[itemSlot.item.name]);
		if (inventoryArray.length != 10) console.log('warning: inventory does not have 10 slots!');
		res.send(inventoryArray);
	});
});

module.exports = router;
