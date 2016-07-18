var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// schema
var accessControlSchema = new Schema({
	type: String,
	permissions: [String],
	viewRights: Number			//public = 1, special/private/custom = 2, manager = 3, all/admin = 5 
})


// export
module.exports = mongoose.model('accessControl', accessControlSchema);
module.exports.schema = accessControlSchema;