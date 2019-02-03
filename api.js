const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');

const User = require('./models/user');
const worldModels = require('./models/world');
const World = worldModels.World;
const Tile = worldModels.Tile;

const TILE_INFO = require('./maps/tile-info.json');

// true: reset the world state permanently. false: world loads as normal.
const RESET_WORLD_STATE = false;

// querying the entire world map every time we want to do anything is very slow...
// new strategy: the server stores a snapshot of the world every half second in a local variable
// that can be accessed very quickly. only world updates (not world gets) talk to db.
// examples of world updates: item pickup/dropping, ......
var tutorialWorld;
setInterval(() => {
    World.findOne({ name: 'tutorial' }, (err, worldDocument) => {
        if (err) console.log(err);
        tutorialWorld = worldDocument;
    });
}, 500);

// turn xy coordinates of a 2d array into a flattened array index
// cols: number of columns in 2d array
function flatIndex(x, y, cols) {
    return (x * cols) + y;
}

// turn the ASCII art of the tutorial map into an actual world state.
let mapArray = [];
fs.readFile(__dirname + '/maps/tutorial1', 'utf8', (err, data) => {
    if (err) console.log(err);
    let lines = data.split(/[\r\n]+/g);
    lines.forEach((line) => {
        mapArray.push(line.split(''));
    });
    console.log('map loaded.');
    // strategy: flattening 2D array to a single array since mongo dislikes 2D arrays
    let worldArray = [];
    for (let i=0; i<mapArray.length; i++) {
        for (let j=0; j<mapArray[0].length; j++) {
            worldArray.push(new Tile({
                name: mapArray[i][j],
                tileInfo: TILE_INFO[mapArray[i][j]]
            }));
        }
    }
    World.findOne({ name: 'tutorial' }, (err, worldDocument) => {
        if (worldDocument && RESET_WORLD_STATE) {
            World.deleteOne({ name: 'tutorial' }, (err) => {
                console.log('world state deleted.');
                World.create({
                    name: 'tutorial',
                    rows: mapArray.length,
                    cols: mapArray[0].length,
                    world: worldArray
                });
                console.log('world state recreated.');
            });
        }
        else if (!worldDocument) {
            World.create({
                name: 'tutorial',
                rows: mapArray.length,
                cols: mapArray[0].length,
                world: worldArray
            });
            console.log('world state created.');
        }
        else {
            console.log('world state loaded.');
        }
    });
});

// get current tile player is standing on
router.get('/tile', (req, res) => {
    const x = req.user.x; const y = req.user.y;
    const index = flatIndex(x, y, tutorialWorld.cols);
    res.send(tutorialWorld.world[index].tileInfo);
});

// get current world name player is in
router.get('/world', (req, res) => {
    res.send(req.user.world);
});

// move the player
router.post('/move', (req, res) => {
    const { direction } = req.body;
    let proposedX = req.user.x; let proposedY = req.user.y;
    switch (direction) {
        case 'up':
            proposedX -= 1;
            break;
        case 'down':
            proposedX += 1;
            break;
        case 'left':
            proposedY -= 1;
            break;
        case 'right':
            proposedY += 1;
            break;
        default:
            console.log('invalid move direction');
    }
    // determine if tile is passable, and if it's not, stop movement
    const index = flatIndex(proposedX, proposedY, tutorialWorld.cols);
    tileInfo = tutorialWorld.world[index].tileInfo;
    if (tileInfo.passable) {
        User.updateOne(
            { username: req.user.username },
            { $set: { 'x': proposedX, 'y': proposedY } },
            (err, raw) => res.end()
        );
    } else {
        res.end();
    }
});

// request the 13x13 2D array section of the map based on current position 
router.get('/map', (req, res) => {
    const x = req.user.x; const y = req.user.y;
    // build the array
    let resArray = [];
    for (let i = x-6; i <= x+6; i++) {
        let line = [];
        for (let j = y-6; j <= y+6; j++) {
            // if out of bounds, fill with blank
            if (i < 0 || j < 0 || i >= tutorialWorld.rows || j >= tutorialWorld.cols) {
                line.push(TILE_INFO[' ']);
            } else if (i === x && j === y) {
                line.push(TILE_INFO['p']);
            } else {
                const index = flatIndex(i, j, tutorialWorld.cols);
                line.push(tutorialWorld.world[index].tileInfo);
            }
        }
        resArray.push(line);
    }
    res.send(resArray);
});

// get current inventory as a 10-element array
router.get('/inventory', (req, res) => {
    let inventoryArray = req.user.inventory.map((itemSlot) => TILE_INFO[itemSlot.item.name]);
    if (inventoryArray.length != 10) console.log('warning: inventory does not have 10 slots!');
    res.send(inventoryArray);
});

// pick up item player is currently standing on
router.post('/pickup', (req, res) => {
    const x = req.user.x; const y = req.user.y;
    const index = flatIndex(x, y, tutorialWorld.cols);
    const tileInfo = tutorialWorld.world[index].tileInfo;
    const tileId = tutorialWorld.world[index]._id;
    const inv = req.user.inventory;
    const invIndex = openInventorySlot(inv);
    if (invIndex === -1) {
        res.end(); return; // no inv space!
    }
    const slotId = inv[invIndex]._id;
    // remove item from world state
    World.updateOne(
        { 'world._id' : tileId },
        {$set: {
            'world.$.name' : ' ',
            'world.$.tileInfo' : TILE_INFO[' '] 
        } },
        (err, doc) => {
            // add item to inventory
            User.updateOne(
                { 'inventory._id' : slotId },
                {
                    $set: { 'inventory.$.item.name' : tileInfo.code },
                    $inc: { 'inventory.$.count' : 1 }
                },
                // give the server enough time to get a new local snapshot
                (err, doc) => { setTimeout(() => { res.end(); }, 500) }
            );
        }
    );
});

function openInventorySlot(inventory) {
    for (let i=0; i<10; i++) {
        if (inventory[i].item.name === '.') return i;
    }
    return -1;
}

module.exports = router;