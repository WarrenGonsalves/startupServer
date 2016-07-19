var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// schema
var userSchema = new Schema({
    userName: String,
    phone: Number,
    password: { type: String, select: false },
    address: String,
    picture: String,
    facebookId: String,
    googleId: String,
    email: { type: String,unique: true},
    verificationCode: String,
    isAuth: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    type: { type: String, select: false },  //ADM, USR

})

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    console.log(err);
    done(err, isMatch);
  });
};

// export
module.exports = mongoose.model('user', userSchema);
module.exports.schema = userSchema;