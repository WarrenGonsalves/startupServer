var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var _ = require("underscore");
var bcrypt = require('bcrypt-nodejs');
// var practitioners = require("./practitioner");

// schema
var studioSchema = new Schema({
  	name: String,
    slug: { type: String, unique: true},
    isActive: { type: Boolean, default: false },
    email: String,
  	phone: Number,
    isAdmin: { type: Boolean, default: false },
    password: { type: String, select: false },
    address: String,
    profile_img: String,
    description: String,
    likes: Number,
  	type: [{type: String, enum: ['salon','spa','stylist']}],
  	circle: Schema.Types.Mixed,
  	circleloc: Schema.Types.Mixed,
    openHours: String,
    owner: {
      name: String,
      description: String,
      image: String
    },
    services: [{
       id: {
          type: Schema.Types.ObjectId,
          ref: 'category'
        },
        price: {type: Number, default: 0.00, set: setPrice },
        service_time: String,
        attributetype:String,
        attributeArray:Schema.Types.Mixed
        
    }],
    products: [{type: String}],
  	features: [{type: String}],
  	images: [{
      	name: String,
      	url: String
  	}],
  	created_date: {
    	type: Date,
    	default: Date.now()
  	},
  	updated_date: Date,
    practitioners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'practitioner'}],
    feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'feedback'},
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'rating'}]
}, 
{strict: false},
{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  id: false
});

studioSchema.index({
  	circleloc: '2dsphere'
});

function setPrice(num){
    return num.toFixed(2);
}

studioSchema.pre('save', function(next) {
  var studio = this;
  if (!studio.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(studio.password, salt, null, function(err, hash) {
      studio.password = hash;
      next();
    });
  });
});

studioSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    console.log(err);
    done(err, isMatch);
  });
};
// export
module.exports = mongoose.model('studio', studioSchema);