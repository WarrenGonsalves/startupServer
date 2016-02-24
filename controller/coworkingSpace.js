var db = require('../db');
var _ = require('underscore');
var util = require('../util');
var AccessControlController = require('../controller/accessControl');
var keys = require('object-keys');
var assert = require('assert');

function CoworkingSpaceController() {};

CoworkingSpaceController.prototype.getAmenities = function(request, reply){
  var requestRights = {
    task: "R_AMENITIES"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel == 2)
        var findUser = request.pre.user._id;
      else if(rights.result.viewLevel == 1)
        var findUser = request.pre.user.orgUserId;
      else if(rights.result.viewLevel > 2)
        var findUser = request.query.user_id;
      db.user.findById(findUser).exec(function(err, user){
        if(!user.ballanceAmenities) return util.reply.error("ballanceAmenities null");
        if (err) {
          util.reply.error(err, reply);
          return;
        }
        reply({
          amenitiesList: user.ballanceAmenities
        });
      });
    }else return util.reply.error("Unauthorized", reply);
  })
};

CoworkingSpaceController.prototype.addAmenities = function(request, reply){
  var requestRights = {
    task: "ADD_AMENITY"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel == 3)
        var findCoworkingSpace = request.pre.user.coworkingId;
      else if(rights.result.viewLevel > 3)
        var findCoworkingSpace = request.query.coworkingId;
      db.coworkingSpace.findById(findCoworkingSpace).exec(function(err, coworking){
        if (err) return util.reply.error(err, reply);
        if(!coworking) return util.reply.error("coworking not found", reply);
        var name = request.payload.name;
        if(coworking.amenities){
          var amenities = coworking.amenities;
        }else var amenities = {};
        if(amenities[name]) return util.reply.error("amenity already exists", reply);
        amenities[name] = request.payload.value;
        coworking.amenities = {};
        coworking.amenities = amenities;
        coworking.save(function (err, coworking) {
            if (err) {
                util.logger.err("coworkingSpace", ["coworkingSpace save error in add amenities", err]);
                util.reply.error(err, reply);
            };
            reply(coworking);
        });
      })
    }else return util.reply.error("Unauthorized", reply);
  })
};

CoworkingSpaceController.prototype.updateAmenities = function(request, reply){
  var requestRights = {
    task: "UPD_AMENITY"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel == 3 )
        var findCoworkingSpace = request.pre.user.coworkingId;
      else if(rights.result.viewLevel > 3 )
        var findCoworkingSpace = request.query.coworkingId;
      db.coworkingSpace.findById(findCoworkingSpace).exec(function(err, coworking){
        if (err) return util.reply.error(err, reply);
        if (!coworking) return util.reply.error("Invalid coworkingSpace ID", reply);
        var amenitiesKey = request.payload.name;
        if(!amenitiesKey) return util.reply.error("Amenity not found", reply);
        coworking.amenities[amenitiesKey] = request.payload.value;
        coworking.save(function (err, coworking) {
            if (err) {
                util.logger.err("coworkingSpace", ["coworkingSpace save error in updateAmenities", err]);
                util.reply.error(err, reply);
            };
            reply(coworking);
        });
      });
    }else return util.reply.error("Unauthorized", reply);
  })
};

CoworkingSpaceController.prototype.deleteAmenities = function(request, reply) {
  var requestRights = {
    task: "DEL_AMENITY"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      db.coworkingSpace.findById(request.pre.user.coworkingId).exec(function(err, coworking){
        var amenitiesKey = request.payload.name;
        if(!amenitiesKey) return util.reply.error("Amenities not found", reply);
        delete coworking.amenities[amenitiesKey];
        coworking.save(function (err, coworking) {
            if (err) {
                util.logger.err("coworkingSpace", ["coworkingSpace save error", err]);
                util.reply.error(err, reply);
            };
            reply(coworking);
        });
      })
    }else return util.reply.error("Unauthorized", reply);
  })
};

CoworkingSpaceController.prototype.updateCoworkingSpace = function(request, reply){
  var requestRights = {
    task: "UPD_COWORKINGSPACE"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function(rights){
    if(rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      db.coworkingSpace.findById(request.query.coworkingId).exec(function(err, coworking){
        if(!coworking) return util.reply.error("coworkingSpace not found", reply);
        coworking.name = request.payload.name;
        coworking.subdomain = request.payload.subdomain;
        coworking.address = request.payload.address;
        coworking.paymentSalts = request.payload.paymentSalts;
        for(i=0;i<=coworking.logos.length;i++){
          if(coworking.logos[i] == request.payload.logosName)
            coworking.logos[i] = request.payload.logosValue;
        }
        if(request.payload.logosNewValue)
          coworking.logos.push(request.payload.logosNewValue);
        coworking.save(function (err, coworking) {
            if (err) {
                util.logger.err("coworkingSpace", ["coworkingSpace save error", err]);
                util.reply.error(err, reply);
            };
            reply(coworking);
        });
      });
    }else return util.reply.error("Unauthorized", reply);
  })
};

CoworkingSpaceController.prototype.userAmenitiesRecharge = function(request, reply){
  var requestRights = {
    task : "RECH_AMENITIES"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function(rights){
    if(rights.status != 200)
     return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel < 3)
        var findUser = request.pre.user._id;
      if(rights.result.viewLevel > 2)
        var findUser = request.query.user_id;
      db.user.findById(findUser).exec(function(err, user){
        db.coworkingSpace.findById(request.query.coworkingId).exec(function(err, coworking){
          if(!coworking) return util.reply.error("coworking not found", reply);
          var rechargedAmenities = Object.keys(request.payload.amenities);
          var amenities = coworking.amenities;
          for(var i=0 ; i < rechargedAmenities.length; i++){
            if(coworking.amenities[rechargedAmenities[0]] < Number(request.payload.amenities[rechargedAmenities[i]]))
              return util.reply.error("Not enough amenities available in coworkingSpace", reply);
            user.ballanceAmenities[rechargedAmenities[i]] = user.ballanceAmenities[rechargedAmenities[i]] + Number(request.payload.amenities[rechargedAmenities[i]]);
            amenities[rechargedAmenities[i]] = amenities[rechargedAmenities[i]] - Number(request.payload.amenities[rechargedAmenities[i]]);
          }
          coworking.amenities = {};
          coworking.amenities = amenities;
          user.save(function (err, user) {
              if (err) {
                  util.logger.err("user", ["ballanceAmenities save error in userAmenitiesRecharge", err]);
                  util.reply.error(err, reply);
              };
              reply(user.ballanceAmenities);
          });
          coworking.save(function (err, coworking) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error", err]);
                  util.reply.error(err, reply);
              };
          });
        })
      })
    }else return util.reply.error("Unauthorized", reply);
  });
}

module.exports = new CoworkingSpaceController();
