var BASE_URL = '/user';
var UserController = require('../controller/user');
var AuthController = require('../controller/auth');

module.exports = function() {
  return [
    {
      method: 'GET',
      path: BASE_URL + '/list',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: UserController.getUserList
    },{
      method: 'POST',
      path: BASE_URL + '/userName',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: UserController.changeUserName
    },{
      method: 'POST',
      path: BASE_URL + '/create',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: UserController.addUser
    },{
      method: 'POST',
      path: BASE_URL + '/phone',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: UserController.changePhone
    },{
      method: 'POST',
      path: BASE_URL + '/email',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: UserController.changeEmail
    },{
      method: 'DELETE',
      path: BASE_URL + '/{userId}',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: UserController.deleteUser
    }
  ];
}();