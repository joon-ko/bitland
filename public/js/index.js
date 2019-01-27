let keysDown = {};
let testPlayer = undefined;

axios.get('/api/player')
	.then((res) => {
		testPlayer = res.data;
		updateMap();
	})
	.catch((err) => console.log(err));

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
			updateMap();
		})
		.catch((err) => console.log(err));
}

function updateMap() {
	axios.post('/api/map', { x: testPlayer.x, y: testPlayer.y })
		.then((res) => {
			handleMap(res.data);
		})
		.catch((err) => console.log(err));
}

// construct the div to display the map
function handleMap(map) {
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

