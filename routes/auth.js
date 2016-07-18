var BASE_URL = '/auth';
var AuthController = require('../controller/auth');

module.exports = function() {
  return [
    {
      method: 'POST',
      path: BASE_URL + '/login',
      config: AuthController.postLogin
    },
    {
      method: 'POST',
      path: BASE_URL + '/changePassword',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: AuthController.changePassword
    },
    {
      method: 'POST',
      path: BASE_URL + '/resetPassword',
      config: AuthController.resetPassword
    }
  ];
}();