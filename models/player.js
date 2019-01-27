const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
	name : String,
	x    : Number,
	y    : Number
});

module.exports = mongoose.model('Player', PlayerSchema);