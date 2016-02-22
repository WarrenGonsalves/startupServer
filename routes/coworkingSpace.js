var BASE_URL = '/coworkingSpace';
var CoworkingSpaceController = require('../controller/coworkingSpace');
var AuthController = require('../controller/auth');

module.exports = function(){
  return [
    {
      method: 'GET',
      path: BASE_URL + '/amenities',
      config: {
        pre: [
          { method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: CoworkingSpaceController.getAmenities
    },
    // {
    //   method: 'POST',
    //   path: BASE_URL + '/recharge/:amenitiesId',
    //   config: {
    //     pre: [
    //       {method: AuthController.ensureAuthenticatedUser, assign: 'user'}
    //     ]
    //   },
    //   handler: CoworkingSpaceController.postAmenitiesRecharge
    // },
    {
      method: 'POST',
      path: BASE_URL + '/amenities/add',
      config: {
        pre: [
          {method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: CoworkingSpaceController.addAmenities
    },
    {
      method: 'POST',
      path: BASE_URL + '/amenities/update',
      config: {
        pre: [
          {method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: CoworkingSpaceController.updateAmenities
    },
    {
      method: 'POST',
      path: BASE_URL + '/amenities/delete',
      config: {
        pre: [
          {method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: CoworkingSpaceController.deleteAmenities
    },
    {
      method: 'POST',
      path: BASE_URL + '/update',
      config: {
        pre: [
          {method: AuthController.ensureAuthenticatedUser, assign: 'user'}
        ]
      },
      handler: CoworkingSpaceController.updateCoworkingSpace
    },
  ];
}();
