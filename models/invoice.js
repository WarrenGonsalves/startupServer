var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var db = require('../db');

// schema
var invoiceSchema = new Schema({
    invoiceNo: Number,
    coworkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'coworkingSpace'},
    issueeId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    lineItems: [{
        item: String,
        amount: Number,
        quantity: Number
    }],
    discount: {
        typ: String,      //"percent", "fixed"
        value: Number
    },
    total: Number,
    status: {
        type: String,
        default: 'unpaid',
        enum: ['paid', 'unpaid', 'cancelled']
    },
    transactionId: String,
    mop: {
        type: String,
        default: 'unpaid',
        enum: ['cash', 'credit-card', 'online', 'NEFT', 'cheque']
    },
    issueDate: {
        type: Date,
        default: Date.now()
    },
    paidDate: Date
})

// methods
invoiceSchema.methods.setInvoiceNo = function(cb) {

    var currInvoice = this;

    db.counter.getNextInvoice(function(err, count) {
        currInvoice.invoiceNo = count;
        currInvoice.save(function (err, invoice) {
            cb(invoice);
        });
    });
}

invoiceSchema.methods.getInvoiceNo = function() {
    return this.invoiceNo;
}

// export
module.exports = mongoose.model('invoice', invoiceSchema);
module.exports.schema = invoiceSchema;