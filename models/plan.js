var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// schema
var planSchema = new Schema({
	coworkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'coworkingSpace'},
	amenities: {
	  coffee: Number,
	  seats: {type:Number, default: 1},
	  printerPaper: Number
	},
	active: { type: Boolean, default: false },	//active, inactive
	visibility: { type: Number, default: 3 }, // public = 1, private/manager = 3
	name: String

})


// export
module.exports = mongoose.model('plan', planSchema);
module.exports.schema = planSchema;