var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var moment = require('moment-timezone');

// schema
var loggerSchema = new Schema({
    level: String,
    tag: String,
    log: String,
    data: String,
    created_date: Date
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
    id: false
});

// virtuals
loggerSchema
    .virtual('created')
    .get(function() {
        return moment(this.created_date).tz('Asia/Kolkata').format('MMM Do, h:mm:ss a');
    });

// export
module.exports = mongoose.model('logger', loggerSchema);
module.exports.schema = loggerSchema;