// keys that are currently held down (prevent multiple events for holding down a key)
let keysDown = {};

// initial display
update();

// handle all key commands
document.addEventListener('keydown', (e) => {
    if (!(e.keyCode in keysDown)) {
        keysDown[e.keyCode] = true;
        const menuSelected = document.getElementsByClassName('menu-selected')[0];
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
            case 65: // a (INFO)
                if (menuSelected.id !== 'info') displayInfo();
                const infoTab = document.getElementById('info');
                selectMenuTab(infoTab);
                break;
            case 83: // s (INVENTORY)
                if (menuSelected.id !== 'inventory') displayInventory();
                const inventoryTab = document.getElementById('inventory');
                selectMenuTab(inventoryTab);
                break;
            case 68: // d (STATS)
                if (menuSelected.id !== 'stats') displayStats();
                const statsTab = document.getElementById('stats');
                selectMenuTab(statsTab);
                break;

            // ZXCV commands (map actions)
            case 90: // z
                worldActionZ();
                break;

            // QWER commands (inventory actions)
            case 81: // q
                inventoryActionQ();
                break;

            // inventory select commands (0-9)
            case 49: // 1
                if (menuSelected.id === 'inventory') selectInventorySlot(1);
                break;
            case 50: // 2
                if (menuSelected.id === 'inventory') selectInventorySlot(2);
                break;
            case 51: // 3
                if (menuSelected.id === 'inventory') selectInventorySlot(3);
                break;
            case 52: // 4
                if (menuSelected.id === 'inventory') selectInventorySlot(4);
                break;
            case 53: // 5
                if (menuSelected.id === 'inventory') selectInventorySlot(5);
                break;
            case 54: // 6
                if (menuSelected.id === 'inventory') selectInventorySlot(6);
                break;
            case 55: // 7
                if (menuSelected.id === 'inventory') selectInventorySlot(7);
                break;
            case 56: // 8
                if (menuSelected.id === 'inventory') selectInventorySlot(8);
                break;
            case 57: // 9
                if (menuSelected.id === 'inventory') selectInventorySlot(9);
                break;
            case 48: // 0
                if (menuSelected.id === 'inventory') selectInventorySlot(0);
                break;
        }
    }
});
document.addEventListener('keyup', (e) => {
    delete keysDown[e.keyCode];
});

function move(dir) {
    axios.post('/api/move', { direction: dir }).then((res) => update());
}

// general-purpose update of the screen, usually after movement
function update() {
    axios.get('/api/map')
        .then((res) => {
            displayWorldName();
            displayMap(res.data);
            const menuSelected = document.getElementsByClassName('menu-selected')[0];
            if (menuSelected.id === 'info') displayInfo();
        });
}

// get the current tab that is selected in the menu, deselect it,
// then select a new tab
function selectMenuTab(tab) {
    const selected = document.getElementsByClassName('menu-selected')[0];
    selected.classList.remove('menu-selected');
    tab.classList.add('menu-selected');
}

function selectInventorySlot(slot) {
    const selected = document.getElementsByClassName('inventory-selected')[0];
    if (selected) selected.classList.remove('inventory-selected');
    const slotDiv = document.getElementById(`inventory-slot-${slot}`);
    slotDiv.classList.add('inventory-selected');

    axios.get('/api/inventory')
    .then((res) => {
        const inventoryArray = res.data;
        const menuDisplay = document.getElementById('menu-display');
        let invActions = document.getElementById('inventory-actions');
        if (invActions) clearNode(invActions);
        else { 
            invActions = document.createElement('div');
            invActions.id = 'inventory-actions';
        }
        const arrayIndex = (slot + 9) % 10;
        const actions = inventoryArray[arrayIndex].inventoryActions;
        if (actions) {
            for (action in actions) {
                const invAction = document.createElement('div');
                invAction.className = 'inventory-action';
                invAction.innerHTML = `<strong>${action}</strong>: ${actions[action]}`;
                invActions.appendChild(invAction);
            }
        }
        menuDisplay.appendChild(invActions);
    });
}

// displays the current world name above the map
function displayWorldName() {
    const worldNameDiv = document.getElementById('world-name');
    axios.get('/api/world')
        .then((res) => {
            const worldName = res.data;
            worldNameDiv.innerHTML = worldName;
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
            const invSlots = document.createElement('div');
            invSlots.id = "inventory-slots";
            for (let i=0; i<10; i++) {
                const invSlotContainer = document.createElement('div');
                invSlotContainer.className = 'inventory-slot-container';

                const invSlot = document.createElement('div');
                const itemInfo = inventoryArray[i];
                invSlot.className = 'inventory-slot';
                // the '.' tile represents an empty item, so display with a blank
                invSlot.innerHTML = (itemInfo.text === '.' ? ' ' : itemInfo.text);
                applyStyle(invSlot, itemInfo.style);

                invSlotContainer.appendChild(invSlot);

                const invSlotNumber = document.createElement('div');
                invSlotNumber.className = 'inventory-slot-number';
                const number = (i+1) % 10;
                invSlotNumber.id = `inventory-slot-${number}`;
                invSlotNumber.innerHTML = `${number}`;

                invSlotContainer.appendChild(invSlotNumber);

                invSlots.appendChild(invSlotContainer);
            }
            menuDisplay.appendChild(invSlots);
        });
}

// displays the current tile and any messages to the menu display
function displayInfo() {
    axios.get('/api/tile')
        .then((res) => {
            const menuDisplay = document.getElementById('menu-display');
            clearNode(menuDisplay);
            const tileInfo = res.data;
            // construct info display div
            const infoDiv = document.createElement('div');
            infoDiv.id = 'info-div';
            const top = document.createElement('div');
            top.id = 'info-div-top';
            const tileIcon = document.createElement('div');
            tileIcon.id = 'info-div-tile';
            tileIcon.innerHTML = tileInfo.text;
            applyStyle(tileIcon, tileInfo.style);
            top.appendChild(tileIcon);
            const tileDescription = document.createElement('div');
            tileDescription.id = 'info-div-description';
            tileDescription.innerHTML = tileInfo.description;
            top.appendChild(tileDescription);
            infoDiv.appendChild(top);
            const message = document.createElement('div');
            message.id = 'info-div-message';
            message.innerHTML = (tileInfo.message ? tileInfo.message : '');
            infoDiv.appendChild(message);
            menuDisplay.appendChild(infoDiv);
        });
}

// displays user stats, such as health, strength, etc. as well as current XP
function displayStats() {
    axios.get('/api/stats')
    .then((res) => {
        const stats = res.data;
        const menuDisplay = document.getElementById('menu-display');
        clearNode(menuDisplay);

        const statsContainer = document.createElement('div');
        statsContainer.id = 'stats-container';

        const hpContainer = document.createElement('div');
        hpContainer.id = 'health-container';
        hpContainer.className = 'stat-container';
        hpContainer.innerHTML = `<strong>hp:</strong> ${stats.health}`;
        statsContainer.appendChild(hpContainer);

        const attContainer = document.createElement('div');
        attContainer.id = 'attack-container';
        attContainer.className = 'stat-container';
        attContainer.innerHTML = `<strong>att:</strong> ${stats.attack}`;
        statsContainer.appendChild(attContainer);

        const strContainer = document.createElement('div');
        strContainer.id = 'strength-container';
        strContainer.className = 'stat-container';
        strContainer.innerHTML = `<strong>str:</strong> ${stats.strength}`;
        statsContainer.appendChild(strContainer);

        const defContainer = document.createElement('div');
        defContainer.id = 'defense-container';
        defContainer.className = 'stat-container';
        defContainer.innerHTML = `<strong>def:</strong> ${stats.defense}`;
        statsContainer.appendChild(defContainer);

        menuDisplay.appendChild(statsContainer);
    });
}

// attempts to do the action associated with the Z key
function worldActionZ() {
    axios.get('/api/tile')
        .then((res) => {
            const tileInfo = res.data;
            if (tileInfo.worldActions && tileInfo.worldActions.z) {
                handleAction(tileInfo.worldActions.z);
            }
        });
}

function inventoryActionQ() {
    axios.get('/api/inventory')
        .then((res) => {
            const inventoryArray = res.data;
            const selected = document.getElementsByClassName('inventory-selected')[0];
            if (selected) {
                const slot = selected.id.split('-')[2];
                const arrayIndex = (parseInt(slot) + 9) % 10;
                const item = inventoryArray[arrayIndex];
                if (item.inventoryActions && item.inventoryActions.q) {
                    handleAction(item.inventoryActions.q);
                }
            }
        });
}

// handle a valid action
function handleAction(action) {
    switch (action) {
        case "pick up":
            axios.post('/api/pickup', {}).then((res) => update());
            break;
        case "drop":
            const selected = document.getElementsByClassName('inventory-selected')[0];
            const slot = selected.id.split('-')[2];
            const arrayIndex = (parseInt(slot) + 9) % 10;
            console.log(arrayIndex);
            axios.post('/api/drop', {index: arrayIndex}).then((res) => displayInventory());
            break;
    }
}

// displays the 13x13 map in the circular view style.
function displayMap(map) {
    const mapDiv = document.getElementById('map');
    clearNode(mapDiv);
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            const tile = constructTile(map, i, j);
            mapDiv.appendChild(tile);
        }
    }

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