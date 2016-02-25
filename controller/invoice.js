var db = require('../db');
var _ = require('underscore');
var util = require('../util');
var AccessControlController = require('../controller/accessControl');

function InvoiceController() {};

InvoiceController.prototype.getInvoices = function(request, reply) {
  var requestRights = {
    task: "R_INVOICES"
  }
  console.log("In InvoiceController getInvoices");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
  console.log("rights returned");
    console.log(rights.status);
    console.log(rights);
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      var query_param = {}
      // query_param['visibility'] = {$lte: rights.result.viewLevel};
      if (rights.result.viewLevel < 3) {
        query_param['issueeId'] = {$eq: request.pre.user._id};
      }else if (rights.result.viewLevel == 3) {
        query_param['coworkingId'] = {$eq: request.pre.user.coworkingId};
      }else if (rights.result.viewLevel > 3) {
        query_param['coworkingId'] = {$eq: request.pre.user.coworkingId};
      };
      
      db.invoice.find(query_param).exec(function(err, invoiceList) {
        if (err) {
          util.reply.error(err, reply);
          return;
        }

        reply({
          invoiceList: invoiceList
        });
      });  
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

InvoiceController.prototype.getInvoice = function(request, reply) {
  var requestRights = {
    task: "R_INVOICES"
  }
  console.log("In InvoiceController getInvoice");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
  console.log("rights returned");
    console.log(rights.status);
    console.log(rights);
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      var query_param = {}
      // query_param['visibility'] = {$lte: rights.result.viewLevel};
      if (rights.result.viewLevel < 3) {
        query_param['issueeId'] = {$eq: request.pre.user._id};
      }else if (rights.result.viewLevel == 3) {
        query_param['coworkingId'] = {$eq: request.pre.user.coworkingId};
      }else if (rights.result.viewLevel > 3) {
        query_param['coworkingId'] = {$eq: request.pre.user.coworkingId};
      };
      
      db.invoice.findById(request.params.invoiceId).exec(function(err, invoice) {
        if (err) {
          util.reply.error(err, reply);
          return;
        }
        if (rights.result.viewLevel < 3) {
          if (!invoice.issueeId.equals(request.pre.user._id)) 
            return util.reply.error("Unauthorized", reply);
        }else if (rights.result.viewLevel == 3) {
          if (!invoice.coworkingId.equals(request.pre.user.coworkingId))
            return util.reply.error("Unauthorized", reply);
        }else if (rights.result.viewLevel > 3) {
          // query_param['coworkingId'] = {$eq: request.pre.user.coworkingId};
        };
        reply(invoice);
      });  
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

InvoiceController.prototype.postCreateInvoice = function(request, reply) {
  var requestRights = {
    task: "ADD_INVOICE"
  }
  console.log("In InvoiceController postCreateInvoice");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      var data = request.payload;
      data.coworkingId = request.pre.user.coworkingId;
      console.log(data);
      createInvoice(data, function (data) {
        if (data.status != 200) return util.reply.error(data.message, reply);
        reply(data.invoice);
          
      })
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

function createInvoice(data, cb) {

  if (!data.coworkingId) 
    return cb({message:"Need coworkingId", status: 400});
  if (!data.issueeId) 
    return cb({message:"Need issueeId", status: 400});
  if (!data.lineItems || data.lineItems.length < 1) 
    return cb({message:"Invalid line items", status: 400});
  if (!data.mop) 
    return cb({message:"Need mode of payment", status: 400});
  // if (!isNumber(data.total)) 
  //   return cb({message:"Invalid total", status: 400});
  if (!isNumber(data.discount.value)) 
    return cb({message:"Invalid discount value", status: 400});    
  var total = 0;
  var invoice = new db.invoice({
    coworkingId: data.coworkingId,
    issueeId: data.issueeId,
    discount: {
      typ: data.discount.typ,
      value: data.discount.value
    },
    // total: data.total,
    status: data.status,
    transactionId: data.transactionId,
    mop: data.mop
  })
  invoice.lineItems = [];
  for (var i = 0; i < data.lineItems.length; i++) {
    if (!isNumber(data.lineItems[i].amount))
      return cb({message:"Invalid item amount", status: 400});
    if (!isNumber(data.lineItems[i].quantity))
      return cb({message:"Invalid item quantity", status: 400});
    invoice.lineItems.push({
      item: data.lineItems[i].item,
      quantity: data.lineItems[i].quantity,
      amount: data.lineItems[i].amount
    })
    total += data.lineItems[i].quantity*data.lineItems[i].amount;
  }
  if (data.discount) {
    if (data.discount.typ === "percent") {
      if (data.discount.value > 100) 
        return cb({message:"Invalid discount value", status: 400});
      invoice.total = total - total * (data.discount.value/100);
    } else if (data.discount.typ === "fixed") {
      if (data.discount.value > total) 
        return cb({message:"Invalid discount value", status: 400});
      invoice.total = total - data.discount.value;
    } else  
        return cb({message:"Invalid discount type", status: 400});
  } else invoice.total = total;

  invoice.save(function (err, invoice_s) {
    if (err) return cb({message: err, status: 400});
    invoice_s.setInvoiceNo(function (newInvoice) {
      cb({invoice: newInvoice, status: 200});
    })
  })

}



InvoiceController.prototype.postUpdateInvoice = function(request, reply) {
  var requestRights = {
    task: "UPD_INVOICE"
  }
  console.log("In InvoiceController postUpdateInvoice");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      
      if (!request.payload.lineItems || request.payload.lineItems.length < 1) 
        return util.reply.error("Invalid line items", reply);
      if (!request.payload.mop) 
        return util.reply.error("Need mode of payment", reply);
      
      if (!isNumber(request.payload.discount.value)) 
        return util.reply.error("Invalid discount value", reply);

      db.invoice.findById(request.params.invoiceId, function (err, invoice) {
        if (err) return util.reply.error(err, reply);
        if (!invoice.coworkingId.equals(request.pre.user.coworkingId)) 
          return util.reply.error("Unauthorized", reply);
        var total = 0;
        invoice.discount = {
          typ: request.payload.discount.typ,
          value: request.payload.discount.value
        };
        invoice.status = request.payload.status;
        invoice.transactionId = request.payload.transactionId;
        invoice.mop = request.payload.mop;
        invoice.lineItems = [];
        for (var i = 0; i < request.payload.lineItems.length; i++) {
          if (!isNumber(request.payload.lineItems[i].amount))
            return util.reply.error("Invalid item amount", reply);
          if (!isNumber(request.payload.lineItems[i].quantity))
            return util.reply.error("Invalid item quantity", reply);
          invoice.lineItems.push({
            item: request.payload.lineItems[i].item,
            quantity: request.payload.lineItems[i].quantity,
            amount: request.payload.lineItems[i].amount
          })
          total += request.payload.lineItems[i].quantity*request.payload.lineItems[i].amount;
        }
        if (request.payload.discount) {
          if (request.payload.discount.typ === "percent") {
            if (request.payload.discount.value > 100) 
              return util.reply.error("Invalid discount value", reply);
            invoice.total = total - total * (request.payload.discount.value/100);
          } else if (request.payload.discount.typ === "fixed") {
            if (request.payload.discount.value > total) 
              return util.reply.error("Invalid discount value", reply);
            invoice.total = total - request.payload.discount.value;
          } else  
              return util.reply.error("Invalid discount type", reply);
        } else invoice.total = total;

        invoice.save(function (err, invoice_s) {
          if (err) return util.reply.error(err, reply);
          reply({invoice: invoice_s, status: 200});
        })
      })
      
    }else return util.reply.error("Unauthorized", reply);
    
  })
};


function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n) && n > -1;
}

module.exports = new InvoiceController();