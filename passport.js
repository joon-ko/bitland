const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const model = require('./models/model');
const User = model.User;

passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ username: username }, (err, user) => {
			if (err) return done(err);
			if (!user) return done(null, false);
			if (!user.verifyPassword(password)) return done(null, false);
			return done(null, user);
		});
	})
);

passport.serializeUser((user, done) => {
  done(null, user.player);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;