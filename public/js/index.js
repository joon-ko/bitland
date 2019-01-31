// keys that are currently held down (prevent multiple events for holding down a key)
let keysDown = {};

// initial display of map
update();

// handle all key commands
document.addEventListener('keydown', (e) => {
    if (!(e.keyCode in keysDown)) {
        keysDown[e.keyCode] = true;
        switch (e.keyCode) {

            // movement commands
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

            // menu tab commands
            case 73: // i (for INVENTORY)
                displayInventory();
                const inventoryTab = document.getElementById('inventory');
                selectMenuTab(inventoryTab);
                break;
            case 76: // l (for LOG)
                displayLog();
                const logTab = document.getElementById('log');
                selectMenuTab(logTab);
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
            const selected = getSelectedMenuTab();
            if (selected.id === 'inventory') displayInventory();
            else if (selected.id === 'log') displayLog();
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
            tile.innerHTML = tileInfo.text;
            applyStyle(tile, tileInfo.style);
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

// displays the current log message to the menu display
function displayLog() {
    axios.get('/api/tile')
        .then((res) => {
            const menuDisplay = document.getElementById('menu-display');
            clearNode(menuDisplay);
            const tileInfo = res.data;
            // construct log display div
            const logDiv = document.createElement('div');
            logDiv.id = 'log-div';
            if (tileInfo.message) logDiv.innerHTML = tileInfo.message;
            else logDiv.innerHTML = 'tutorial';
            menuDisplay.appendChild(logDiv);
        });
}

// displays the user's inventory to the menu display
function displayInventory() {
    axios.get('/api/inventory')
        .then((res) => {
            const menuDisplay = document.getElementById('menu-display');
            clearNode(menuDisplay);
            const inventoryArray = res.data;
            // construct the inventory slot divs
            for (let i=0; i<10; i++) {
                const invSlot = document.createElement('div');
                const itemInfo = inventoryArray[i];
                invSlot.className = 'inventory-slot';
                invSlot.innerHTML = itemInfo.text;
                applyStyle(invSlot, itemInfo.style);
                menuDisplay.appendChild(invSlot);
            }
        });
}

// takes a DOM node and applies currently supported styles to it.
// for example, if the template was { color: 'blue' },
// this function would apply node.style.color = 'blue'.
function applyStyle(node, template) {
    if (template.hasOwnProperty('color'))
        node.style.color = template.color;
    if (template.hasOwnProperty('backgroundColor'))
        node.style.backgroundColor = template.backgroundColor;
    if (template.hasOwnProperty('fontWeight'))
        node.style.fontWeight = template.fontWeight;
}

// clear all children and inner text from a DOM node
function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

// get the current tab that is selected in the menu, deselect it,
// then select a new tab
function selectMenuTab(tab) {
    const selected = document.getElementsByClassName('selected')[0];
    selected.classList.remove('selected');
    tab.classList.add('selected');
}

// get the current tab that is selected in the menu
function getSelectedMenuTab() {
    return document.getElementsByClassName('selected')[0];
}
