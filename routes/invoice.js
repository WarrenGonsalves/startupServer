var BASE_URL = '/invoice';
var InvoiceController = require('../controller/invoice');
var AuthController = require('../controller/auth');

module.exports = function() {
  return [
    {
      method: 'GET',
      path: BASE_URL,
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: InvoiceController.getInvoices
    },
    {
      method: 'GET',
      path: BASE_URL + "/{invoiceId}",
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: InvoiceController.getInvoice
    },
    {
      method: 'POST',
      path: BASE_URL,
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: InvoiceController.postCreateInvoice
    },
    {
      method: 'POST',
      path: BASE_URL + '/update/{invoiceId}',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: InvoiceController.postUpdateInvoice
    }
  ];
}();