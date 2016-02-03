/*
 *   Stores configuration for server / db
 *   Overide necessary properties for local developement
 */
var util = require('../util');

var config = module.exports = {};

config.tokenSecret = "sdjh8734jsd92kjsd02djk2z";
// server config
config.server = {};
process.env.NODE_ENV = 'dev';
// mongodb
config.mongo = {};

config.env = 'local';
config.server.ip = '127.0.0.1';
config.server.port = '5000';
// Mongo
config.mongo.connecturl = "mongodb://127.0.0.1:27017/geek";
    
console.log("ENV_MONGO: " + config.mongo.connecturl);
