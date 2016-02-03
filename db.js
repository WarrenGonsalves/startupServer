var Mongoose = require('mongoose');
var config = require('./config/constants');
var models = require('./models');

//load database
Mongoose.connect(config.mongo.connecturl);
var db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
});

exports.Mongoose = Mongoose;
exports.db = db;
exports.user = models.user;
exports.studio = models.studio;
exports.logger = models.logger;