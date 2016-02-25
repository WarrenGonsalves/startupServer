var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// schema
var counterSchema = new Schema({
    invoice_count: {
        type: Number
    }
});

//statics



counterSchema.statics.getNextInvoice = function(cb) {
    var query = {};
    var update = {
        $inc: {
            invoice_count: 1
        }
    };
    var options = {
        upsert: true
    };

    this.findOneAndUpdate(query, update, options, function(err, counter) {

        if (err) {
            console.log(err);
        }

        console.log("Invoice Counter Model", counter.invoice_count);
        cb(err, counter.invoice_count);
    });
};

// export
module.exports = mongoose.model('counter', counterSchema);
module.exports.schema = counterSchema;