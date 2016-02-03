var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// schema
var userSchema = new Schema({
    userName: String,
    phone: Number,
    password: { type: String, select: false },
    address: String,
    email: { type: String,unique: true},
    isAuth: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    invoiceName: String,
    type: { type: String, select: false }

})

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    console.log(err);
    done(err, isMatch);
  });
};

// export
module.exports = mongoose.model('user', userSchema);
module.exports.schema = userSchema;