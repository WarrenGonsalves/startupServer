var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// schema
var userSchema = new Schema({
    userName: String,
    phone: Number,
    password: { type: String, select: false },
    address: String,
    coworkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'coworkingSpace'},
    orgUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
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
    type: { type: String, select: false },  //ADM, MGR, ORG, COW, OCO
    plans: [{
      planId: { type: mongoose.Schema.Types.ObjectId, ref: 'plan'},
      quantity: Number
    }],
    ballanceAmenities: {
      coffee: Number,
      printerPages: Number
    }

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