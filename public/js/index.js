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

function displayMap(map) {
	const mapContainer = document.getElementById('map-container');
	while (mapContainer.firstChild) {
		mapContainer.removeChild(mapContainer.firstChild);
	}
	const mapDiv = document.createElement('div');
	mapDiv.className = 'map';
	map.forEach((mapLine) => {
		mapLine.forEach((mapTile) => {
			const tile = document.createElement('div');
			tile.className = 'tile';
			tile.innerHTML = mapTile;
			mapDiv.appendChild(tile);
		});
	});
	mapContainer.appendChild(mapDiv);
}

