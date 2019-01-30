const express = require('express');
const app = express();
require('dotenv').config();
const bp = require('body-parser');
const db = require('./db');
const api = require('./api');
const passport = require('./passport');
const session = require('express-session');
const nunjucks = require('nunjucks');

app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

nunjucks.configure('views', {
	autoescape: true,
	express: app
});

app.use('/static', express.static('public'));

app.use(session({
  secret: 'session-secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);

app.get('/', (req, res) => {
	if (req.isAuthenticated()) res.render('index.html');
	else res.redirect('/login');
});

app.get('/login', (req, res) => {
	if (req.isAuthenticated()) res.redirect('/');
	else res.render('login.html');
});

app.post('/auth/login',
	passport.authenticate('local'), (req, res, next) => {
		if (req.user) res.send({ redirect: "/" });
		else res.send({ redirect: "/login" });
	}
);

app.get('/logout', (req, res) => {
	req.session.destroy();
	req.logout();
	res.redirect('/login');
});

const User = require('./models/user');
User.findOne({ username: 'test' }, (err, user) => {
	if (user) {
		console.log('test user loaded');
	} else {
		const testUser = new User({
			username: 'test',
			password: 'test123',
			x: 1,
			y: 1
		});
		testUser.save().then(() => console.log('test user created'));
	}
});

app.listen(3000, () => {console.log('app listening on port 3000')});