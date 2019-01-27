const express = require('express');
const app = express();
const bp = require('body-parser');

const path = require('path');
const fs = require('fs');

app.use('/static', express.static('public'));
app.use(bp.json());

app.get('/', (req, res) => {
	res.sendFile('index.html', {root: __dirname});
});

let mapArray = [];
fs.readFile(__dirname + '/maps/testmap1', 'utf8', (err, data) => {
	if (err) console.log(err);
	let lines = data.split('\n');
	lines.forEach((line) => {
		mapArray.push(line.split(''));
	});
	console.log('map loaded');
});

// request the 13x13 2D array section of the map based on current position 
app.post('/api/map', (req, res) => {
	let { x, y } = req.body;

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

app.listen(3000, () => {console.log('app listening on port 3000')});