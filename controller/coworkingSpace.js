var db = require('../db');
var _ = require('underscore');
var util = require('../util');
var AccessControlController = require('../controller/accessControl');

function CoworkingSpaceController() {};

CoworkingSpaceController.prototype.getAmenities = function(request, reply){
  var requestRights = {
    task: "R_AMENITIES"
  }
  console.log("In CoworkingSpaceController getAmenities");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    console.log(rights);
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      //if user is orguser
      db.user.findById(request.pre.user.orgUserId).exec(function(err, user){
        console.log(user.ballanceAmenities);
        if(!user.ballanceAmenities) return util.reply.error("ballanceAmenities null");
        if (err) {
          util.reply.error(err, reply);
          return;
        }
        if(user.ballanceAmenities)
          reply({
            amenitiesList: user.ballanceAmenities
          });
      });

    }else return util.reply.error("Unauthorized", reply);

  })
};

CoworkingSpaceController.prototype.addAmenities = function(request, reply){
  var requestRights = {
    task: "ADD_AMENITIES"
  }
  console.log("In CoworkingSpaceController addAmenities");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    console.log(rights);
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel < 3){
        console.log("rights less dan 3");
        return util.reply.error("You do not have access", reply);
      }
      if(rights.result.viewLevel == 3){
        db.coworkingSpace.findById(request.pre.user.coworkingId).exec(function(err, coworking){
          if (err) return util.reply.error(err, reply);
          if(!coworking) return util.reply.erro("coworking not found", reply);
          console.log(request.pre.user.coworkingId);
          //check if amenities already exist
          var name = request.payload.name;
          // var push = {};
          // push[name] = request.payload.value;
          // coworking.amenities.push(push);
          coworking.amenities[name] = request.payload.value;
          coworking.save(function (err, coworking) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error in add amenities", err]);
                  util.reply.error(err, reply);
              };
              reply(coworking);
          });
        })
      }

      if(rights.result.viewLevel > 3){
        db.coworkingSpace.findOne({name: request.payload.coworkingSpaceName}).exec(function(err, coworkingSpace){
          console.log(coworkingSpace)
          if (err) return util.reply.error(err, reply);
          if (!coworkingSpace) return util.reply.error("Invalid coworkingSpace name", reply);
          //check if amenities already exist
          var name = request.payload.name;
          var push = {};
          push[name] = request.payload.value;
          coworkingSpace.amenities.push(push);
          coworkingSpace.save(function (err, coworkingSpace) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error in add amenities", err]);
                  util.reply.error(err, reply);
              };
              reply(coworkingSpace);
          });
        })
      }
    }else return util.reply.error("Unauthorized", reply);

  })
};

CoworkingSpaceController.prototype.updateAmenities = function(request, reply){
  var requestRights = {
    task: "UPD_AMENITIES"
  }
  console.log("In CoworkingSpaceController updateAmenities");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    console.log(rights);
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel < 3){
        console.log("rights less dan 3");
        return util.reply.error("You do not have access", reply);
      }
      if(rights.result.viewLevel == 3 ){
        db.coworkingSpace.findById(request.pre.user.coworkingId).exec(function(err, coworking){
          if (err) return util.reply.error(err, reply);
          if (!coworking) return util.reply.error("Invalid coworkingSpace ID", reply);
          var amenitiesKey = request.payload.name;
          var updatedValue = request.payload.value;
          if(!amenitiesKey) return util.reply.error("Amenities not found", reply);
          coworking.amenities[amenitiesKey] = request.payload.value;
          // coworking.amenities.update({}, {'$set': {
          //   'amenities.$.amenitiesKey': updatedValue
          // }})
          coworking.save(function (err, coworkingSpace) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error in updateAmenities", err]);
                  util.reply.error(err, reply);
              };
              reply(coworking);
          });
        });
      }
      if(rights.result.viewLevel > 3 ){
        db.coworkingSpace.findOne({name: request.payload.name}, function (err, coworkingSpace) {
          if (err) return util.reply.error(err, reply);
          if (!coworkingSpace) return util.reply.error("Invalid coworkingSpace name", reply);
          console.log(coworkingSpace);
          var amenitiesKey = request.payload.amenitiesKey;
          var updatedValue = request.payload.updatedValue;
          if(!amenitiesKey) return util.reply.error("Amenities not found", reply);
          coworkingSpace.update({}, {'$set': {
            'amenities.$.amenitiesKey': updatedValue
          }})
          coworkingSpace.save(function (err, coworkingSpace) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error", err]);
                  util.reply.error(err, reply);
              };
              reply(coworkingSpace);
          });
        });
      }

    }else return util.reply.error("Unauthorized", reply);

  })
};

CoworkingSpaceController.prototype.deleteAmenities = function(request, reply) {
  var requestRights = {
    task: "DEL_AMENITIES"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel > 2){
        db.coworkingSpace.findById(request.pre.user.coworkingId).exec(function(err, coworking){
          console.log(request.pre.user.coworkingId);
          var amenitiesKey = request.payload.name;
          if(!amenitiesKey) return util.reply.error("Amenities not found", reply);
          // coworkingSpace.update({}, {'$pull': {
          //   'amenities.$.amenitiesKey': ''
          // }})
          coworking.amenities[amenitiesKey].remove();
          coworking.save(function (err, coworkingSpace) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error", err]);
                  util.reply.error(err, reply);
              };
              reply(coworking);
          });
        })
      }
    }else return util.reply.error("Unauthorized", reply);
  })
};

module.exports = new CoworkingSpaceController();
