let xPos = 6;
let yPos = 6;
let keysDown = {};
updateMap();

document.addEventListener('keydown', (e) => {
	if (!(e.keyCode in keysDown)) {
		keysDown[e.keyCode] = true;
		switch (e.keyCode) {
			case 37: // left arrow
				yPos -= 1;
				updateMap();
				break;
			case 38: // up arrow
				xPos -= 1;
				updateMap();
				break;
			case 39: // right arrow
				yPos += 1;
				updateMap();
				break;
			case 40: // down arrow
				xPos += 1;
				updateMap();
				break;
			default:
				console.log(e.keyCode);
		}
	}
	console.log(`xPos: ${xPos}, yPos: ${yPos}`);
});

document.addEventListener('keyup', (e) => {
	delete keysDown[e.keyCode];
});

function updateMap() {
	axios.post('/api/map', {x: xPos, y: yPos})
		.then((res) => {
			handleMap(res.data)
		})
		.catch((err) => {
			console.log(err)
		});
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

