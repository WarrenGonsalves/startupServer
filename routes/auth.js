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
      path: BASE_URL + '/register',
      config: AuthController.postRegister
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
    },
    {
      method: 'POST',
      path: BASE_URL + '/facebook',
      config: AuthController.postFacebookLogin
    },
    {
      method: 'POST',
      path: BASE_URL + '/google',
      config: AuthController.postGoogleLogin
    },
    {
      method: 'POST',
      path: BASE_URL + '/verify/{emailVerificationCode}',
      config: AuthController.verifiyEmail
    }
  ];
}();