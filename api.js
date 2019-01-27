const express = require('express');
const router = express.Router();
const fs = require('fs');

const Player = require('./models/player');

// loading map
let mapArray = [];
fs.readFile(__dirname + '/maps/testmap1', 'utf8', (err, data) => {
	if (err) console.log(err);
	let lines = data.split('\n');
	lines.forEach((line) => {
		mapArray.push(line.split(''));
	});
	console.log('map loaded');
});

// get the test player
router.get('/player', (req, res) => {
	Player.findOne({ name: 'testPlayer' }, (err, player) => {
		if (player) {
			console.log(`found ${player.name}`);
			res.send(player);
		} else console.log('could not find test player');
	});
});

// move the test player
router.post('/move', (req, res) => {
	const { direction } = req.body;
	const query = { name: 'testPlayer' };
	switch (direction) {
		case 'up':
			Player.findOneAndUpdate(
				query,
				{ $inc: { x: -1 } },
				{ new: true },
				(err, player) => { res.send(player); }
			);
			break;
		case 'down':
			Player.findOneAndUpdate(
				query,
				{ $inc: { x: 1 } },
				{ new: true },
				(err, player) => { res.send(player); }
			);
			break;
		case 'left':
			Player.findOneAndUpdate(
				query,
				{ $inc: { y: -1 } },
				{ new: true },
				(err, player) => { res.send(player); }
			);
			break;
		case 'right':
			Player.findOneAndUpdate(
				query,
				{ $inc: { y: 1 } },
				{ new: true },
				(err, player) => { res.send(player); }
			);
			break;
		default:
			console.log('invalid move direction');
	}
})

// request the 13x13 2D array section of the map based on current position 
router.get('/map', (req, res) => {
	Player.findOne({ name: 'testPlayer' }, (err, player) => {
		const { name, x, y } = player;

		// build the array
		let resArray = [];
		for (let i = x-6; i <= x+6; i++) {
			let line = [];
			for (let j = y-6; j <= y+6; j++) {
				// if out of bounds, fill with blank
				if (i < 0 || j < 0 || i >= mapArray.length || j >= mapArray[0].length) {
					line.push(' ');
				} else if (i === x && j === y) {
					line.push('p');
				} else {
					line.push(mapArray[i][j]);
				}
			}
			resArray.push(line);
		}

		res.send(resArray);
	});
});

module.exports = router;