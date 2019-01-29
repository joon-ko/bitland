// keys that are currently held down (prevent multiple events for holding down a key)
let keysDown = {};

// initial display of map
update();

// handle movement with arrow keys
document.addEventListener('keydown', (e) => {
	if (!(e.keyCode in keysDown)) {
		keysDown[e.keyCode] = true;
		switch (e.keyCode) {
			case 37: // left arrow
				move('left');
				break;
			case 38: // up arrow
				move('up');
				break;
			case 39: // right arrow
				move('right');
				break;
			case 40: // down arrow
				move('down');
				break;
		}
	}
});
document.addEventListener('keyup', (e) => {
	delete keysDown[e.keyCode];
});

function move(dir) {
	axios.post('/api/move', { direction: dir })
		.then((res) => {
			update();
		});
}

// general-purpose update of the screen, usually after movement
function update() {
	axios.get('/api/map')
		.then((res) => {
			displayMap(res.data);
			displayLog();
		});
}

// displays the 13x13 map in the circular view style.
function displayMap(map) {

	/* the gist */

	const container = document.getElementById('container');
	const oldMapDiv = document.getElementById('map');
	if (oldMapDiv) container.removeChild(oldMapDiv);
	const mapDiv = document.createElement('div');
	mapDiv.id = 'map';
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[0].length; j++) {
			const tile = constructTile(map, i, j);
			mapDiv.appendChild(tile);
		}
	}
	container.insertBefore(mapDiv, document.getElementById('menu'));

	/* the dirty work */

	// create the tile div
	function constructTile(map, i, j) {
		const tile = document.createElement('div');
		let tileClass = 'tile';
		if (notInRange(i, j)) {
			tileClass += ' invisible';
			tile.innerHTML = ' ';
		} else {
			const tileInfo = map[i][j];
			tile.innerHTML = tileInfo.display.text;
			tile.style.backgroundColor = tileInfo.display.backgroundColor;
			tile.style.color = tileInfo.display.color;
		}
		tileClass += calculateBorderClass(i, j);
		tile.className = tileClass;
		return tile;

		// returns false if coordinates outside the circular display range
		function notInRange(i, j) {
			const outOfRange = [[0, 0],  [0, 1],  [0, 2],  [0, 3],   [0, 9],  [0, 10],  [0, 11],  [0, 12],
								[1, 0],  [1, 1],  [1, 11], [1, 12],  [2, 0],  [2, 12],  [3, 0],   [3, 12],
								[9, 0],  [9, 12], [10, 0], [10, 12], [11, 0], [11, 1],  [11, 11], [11, 12],
								[12, 0], [12, 1], [12, 2], [12, 3],  [12, 9], [12, 10], [12, 11], [12, 12]];
			for (let k = 0; k < outOfRange.length; k++) {
				if (i === outOfRange[k][0] && j === outOfRange[k][1]) return true;
			}
			return false;
		}

		// calculate the correct border that a tile should have
		function calculateBorderClass(i, j) {
			let borderClasses = '';
			const top = [[0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 2], [1, 3],
						 [1, 9], [1, 10], [2, 1], [2, 11], [4, 0], [4, 12]];
			const bot = [[8, 0], [10, 1], [11, 2], [11, 3], [12, 4], [12, 5], [12, 6],
						 [12, 7], [12, 8], [11, 9], [11, 10], [10, 11], [8, 12]];
			const left = [[0, 4], [1, 2], [2, 1], [3, 1], [4, 0], [5, 0], [6, 0],
						  [7, 0], [8, 0], [9, 1], [10, 1], [11, 2], [12, 4]];
			const right = [[0, 8], [1, 10], [2, 11], [3, 11], [4, 12], [5, 12], [6, 12],
						   [7, 12], [8, 12], [9, 11], [10, 11], [11, 10], [12, 8]];
			for (let k = 0; k < 13; k++) {
				if (i === top[k][0] && j === top[k][1]) borderClasses += ' border-t';
				if (i === bot[k][0] && j === bot[k][1]) borderClasses += ' border-b';
				if (i === left[k][0] && j === left[k][1]) borderClasses += ' border-l';
				if (i === right[k][0] && j === right[k][1]) borderClasses += ' border-r';
			}
			return borderClasses;
		}
	}
}

// so far, displays any pertinent messages to the log
function displayLog() {
	axios.get('/api/tile')
		.then((res) => {
			const menuDisplay = document.getElementById('menu-display');
			const tileInfo = res.data;
			if (tileInfo.message) menuDisplay.innerHTML = tileInfo.message;
			else menuDisplay.innerHTML = 'tutorial';
		});
}