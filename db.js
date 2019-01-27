var mongoose = require('mongoose');

mongoose.connect(process.env.ATLAS_SRV, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('db connected') });

module.exports = db;