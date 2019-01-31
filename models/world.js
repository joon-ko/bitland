const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TileSchema = new Schema({
	name : String,
	tileInfo : {}
});

const WorldSchema = new Schema({
	name  : { type: String, index: { unique: true } },
	world : [[TileSchema]]
});

module.exports = {
	World: mongoose.model('World', WorldSchema),
	Tile: mongoose.model('Tile', TileSchema)
};