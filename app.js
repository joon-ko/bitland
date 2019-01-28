const express = require('express');
const app = express();
require('dotenv').config();
const bp = require('body-parser');
const db = require('./db');
const api = require('./api');

app.use(bp.json());
app.use('/static', express.static('public'));
app.use('/api', api);

app.get('/', (req, res) => {
	res.sendFile('index.html', {root: __dirname});
});

// load or create test player
const Player = require('./models/player');
Player.findOne({ name: 'testPlayer' }, (err, player) => {
	if (player) {
		console.log(`${player.name} loaded`);
	}
	else {
		Player.create({ name: 'testPlayer', x: 7, y: 7 })
			.then((player) => {
				console.log(`${player.name} created`);
			});
	}
});

app.listen(3000, () => {console.log('app listening on port 3000')});