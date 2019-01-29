const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
	name       : { type: String, index: { unique: true } },
	x          : { type: Number, default: 1 },
	y          : { type: Number, default: 1 }
});

const UserSchema = new mongoose.Schema({
	username : { type: String, required: true, index: { unique: true } },
	password : { type: String, required: true },
	player   : PlayerSchema
});

UserSchema.methods.verifyPassword = function(candidatePassword) {
	if (candidatePassword === this.password) return true;
	return false;
};

module.exports = {
	User: mongoose.model('User', UserSchema),
	Player: mongoose.model('Player', PlayerSchema)
}