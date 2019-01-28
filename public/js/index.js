// keys that are currently held down (prevent multiple events for holding down a key)
let keysDown = {};

// initial display of map
requestMap();

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
			default:
				console.log(e.keyCode);
		}
	}
});
document.addEventListener('keyup', (e) => {
	delete keysDown[e.keyCode];
});

function move(dir) {
	axios.post('/api/move', { direction: dir })
		.then((res) => {
			testPlayer = res.data;
			requestMap();
		})
		.catch((err) => console.log(err));
}

function requestMap() {
	axios.get('/api/map')
		.then((res) => {
			displayMap(res.data);
		})
		.catch((err) => console.log(err));
}

// displays the 13x13 map in the circular view style.
function displayMap(map) {
	const container = document.getElementById('container');
	const oldMapDiv = document.getElementById('map');
	if (oldMapDiv) container.removeChild(oldMapDiv);
	const mapDiv = document.createElement('div');
	mapDiv.id = 'map';
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[0].length; j++) {
			const tile = document.createElement('div');
			let tileClass = 'tile';
			if (notInRange(i, j)) {
				tileClass += ' invisible';
				tile.innerHTML = ' ';
			} else {
				tile.innerHTML = map[i][j];
			}
			tileClass += calculateBorderClass(i, j);
			tile.className = tileClass;
			mapDiv.appendChild(tile);
		}
	}
	container.insertBefore(mapDiv, document.getElementById('menu'));

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

