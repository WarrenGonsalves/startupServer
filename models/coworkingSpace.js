var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// schema
var coworkingSpaceSchema = new Schema({
	name: String,
	suddomain: String,
	type: String,
	address: String,
	logos: [String],
	paymentSalts: String,
	amenities: {type: mongoose.Schema.Types.Mixed}
})


// export
module.exports = mongoose.model('coworkingSpace', coworkingSpaceSchema);
module.exports.schema = coworkingSpaceSchema;
