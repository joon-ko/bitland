const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	username : { type: String, required: true, index: { unique: true } },
	password : { type: String, required: true },
	x        : { type: Number, default: 1 },
	y        : { type: Number, default: 1 }
});

UserSchema.methods.verifyPassword = function(candidatePassword) {
	if (candidatePassword === this.password) return true;
	return false;
};

module.exports = mongoose.model('User', UserSchema);