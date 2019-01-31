const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TileSchema = new Schema({
	name : String,
	tileInfo : {}
});

const WorldCoordinateSchema = new Schema({
	entities : [TileSchema]
});

const WorldSchema = new Schema({
	name  : String,
	rows  : Number,
	cols  : Number,
	world : [[WorldCoordinateSchema]]
});

module.exports = {
	World: mongoose.model('World', WorldSchema),
	WorldCoordinate: mongoose.model('WorldCoordinate', WorldCoordinateSchema),
	Tile: mongoose.model('Tile', TileSchema)
};