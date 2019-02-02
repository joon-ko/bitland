const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TileSchema = new Schema({
	name : String,
	tileInfo : {}
});

const WorldSchema = new Schema({
	name  : { type: String, index: { unique: true } },
	rows  : Number,
	cols  : Number,
	world : [TileSchema]
});

module.exports = {
	World: mongoose.model('World', WorldSchema),
	Tile: mongoose.model('Tile', TileSchema)
};