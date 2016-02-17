var BASE_URL = '/plans';
var PlanController = require('../controller/plans');
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
      handler: PlanController.getPlans
    },
    {
      method: 'POST',
      path: BASE_URL + '/add',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: PlanController.addPlan
    },
    {
      method: 'POST',
      path: BASE_URL + '/update/{planId}',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: PlanController.updatePlan
    },
    {
      method: 'DELETE',
      path: BASE_URL + '/{planId}',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: PlanController.deletePlan
    },
    {
      method: 'POST',
      path: BASE_URL + '/select/{planId}',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: PlanController.selectPlan
    }
  ];
}();