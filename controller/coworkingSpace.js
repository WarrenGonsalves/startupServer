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
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      db.user.findById(request.pre.user._id).exec(function(err, user){
        if(user.type == "ORG" || user.type == "COW"){
          if(!user.ballanceAmenities) return util.reply.error("ballanceAmenities null");
          if (err) {
            util.reply.error(err, reply);
            return;
          }
          reply({
            amenitiesList: user.ballanceAmenities
          });
        }
        if(user.type == "OCO"){
          db.user.findById(user.orgUserId).exec(function(err, userOrg){
            if(!userOrg.ballanceAmenities) return util.reply.error("ballanceAmenities null");
            if (err) {
              util.reply.error(err, reply);
              return;
            }
            reply({
              amenitiesList: userOrg.ballanceAmenities
            });
          })
        }
        if(user.type == "MGR" || user.type == "ADM"){
          if(request.query.user_id){
            db.user.findOne(request.query.user_id).exec(function(err, user){
              if(!user) return util.reply.error("User not found", reply);
              if(!user.ballanceAmenities) return util.reply.error("ballanceAmenities null");
              if (err) {
                util.reply.error(err, reply);
                return;
              }
              reply({
                amenitiesList: user.ballanceAmenities
              });
            })
          }else return util.reply.error("query not found", reply);
        }
    });

    }else return util.reply.error("Unauthorized", reply);

  })
};

CoworkingSpaceController.prototype.addAmenities = function(request, reply){
  var requestRights = {
    task: "ADD_AMENITY"
  }
  console.log("In CoworkingSpaceController addAmenities");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    console.log(rights);
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel < 3){
        return util.reply.error("You do not have access", reply);
      }
      if(rights.result.viewLevel == 3){
        db.coworkingSpace.findById(request.pre.user.coworkingId).exec(function(err, coworking){
          if (err) return util.reply.error(err, reply);
          if(!coworking) return util.reply.error("coworking not found", reply);
          var name = request.payload.name;
          if(coworking.amenities){
            var amenities = coworking.amenities;
          }else var amenities = {};
          if(amenities[name]) return util.reply.error("amenities already exists", reply);
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
      }

      if(rights.result.viewLevel > 3){
        db.coworkingSpace.findOne({name: request.payload.coworkingSpaceName}).exec(function(err, coworking){
          if (err) return util.reply.error(err, reply);
          if (!coworking) return util.reply.error("Invalid coworkingSpace name", reply);
          //check if amenities already exist
          var name = request.payload.name;
          if(coworking.amenities){
            var amenities = coworking.amenities;
          }else var amenities = {};
          if(amenities[name]) return util.reply.error("amenities already exists", reply);
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
      }
    }else return util.reply.error("Unauthorized", reply);

  })
};

CoworkingSpaceController.prototype.updateAmenities = function(request, reply){
  var requestRights = {
    task: "UPD_AMENITY"
  }
  console.log("In CoworkingSpaceController updateAmenities");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    console.log(rights);
    if (rights.status != 200)
      return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(rights.result.viewLevel < 3){
        return util.reply.error("You do not have access", reply);
      }
      if(rights.result.viewLevel == 3 ){
        db.coworkingSpace.findById(request.pre.user.coworkingId).exec(function(err, coworking){
          if (err) return util.reply.error(err, reply);
          if (!coworking) return util.reply.error("Invalid coworkingSpace ID", reply);
          var amenitiesKey = request.payload.name;
          if(!amenitiesKey) return util.reply.error("Amenities not found", reply);
          coworking.amenities[amenitiesKey] = request.payload.value;
          coworking.save(function (err, coworking) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error in updateAmenities", err]);
                  util.reply.error(err, reply);
              };
              reply(coworking);
          });
        });
      }
      if(rights.result.viewLevel > 3 ){
        db.coworkingSpace.findOne({name: request.payload.name}, function (err, coworking) {
          if (err) return util.reply.error(err, reply);
          if (!coworking) return util.reply.error("Invalid coworkingSpace name", reply);
          var amenitiesKey = request.payload.amenitiesKey;
          if(!amenitiesKey) return util.reply.error("Amenities not found", reply);
          coworking.amenities[amenitiesKey] = request.payload.value;
          coworking.save(function (err, coworking) {
              if (err) {
                  util.logger.err("coworkingSpace", ["coworkingSpace save error", err]);
                  util.reply.error(err, reply);
              };
              reply(coworking);
          });
        });
      }

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
      if(rights.result.viewLevel > 2){
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
      }
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
      if(rights.result.viewLevel > 2){
        db.coworkingSpace.findOne({name: request.payload.coworkingSpaceName}).exec(function(err, coworking){
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
      }
    }else return util.reply.error("Unauthorized", reply);
  })
};

CoworkingSpaceController.prototype.userAmenitiesRecharge = function(request, reply){
  var requestRights = {
    task : "RECH_AMENITY"
  }
  AccessControlController.validateAccessMid(requestRights, request.pre, function(rights){
    if(rights.status != 200)
     return util.reply.error(rights.message, reply);
    if(rights.result.access){
      if(request.pre.user.type == "OCO")
        return util.reply.error("You do not have access for this operation", reply);
      if(request.pre.user.type == 'ORG' || request.pre.user.type == 'COW'){
        db.user.findById(request.pre.user._id).exec(function(err, user){
          var name = request.payload.name;
          if(!user.ballanceAmenities[name]) return util.reply.error("No such amenity found", reply);
          user.ballanceAmenities[name] = user.ballanceAmenities[name] + Number(request.payload.value);;
          user.save(function (err, user) {
              if (err) {
                  util.logger.err("user", ["ballanceAmenities save error in userAmenitiesRecharge", err]);
                  util.reply.error(err, reply);
              };
              reply(user.ballanceAmenities);
          });
        })
      }
      if(request.pre.user.type == 'MGR' || request.pre.user.type == 'ADM'){
        db.user.findOne({email: request.payload.email}).exec(function(err, user){
          if(!user) return util.reply.error("User not found, enter correct email", reply);
          var name = request.payload.name;
          if(!user.ballanceAmenities[name]) return util.reply.error("No such amenity found", reply);
          user.ballanceAmenities[name] = user.ballanceAmenities[name] + Number(request.payload.value);
          user.save(function (err, user) {
              if (err) {
                  util.logger.err("user", ["ballanceAmenities save error in userAmenitiesRecharge", err]);
                  util.reply.error(err, reply);
              };
              reply(user.ballanceAmenities);
          });
        });
      }
    }else return util.reply.error("Unauthorized", reply);
  });
}

module.exports = new CoworkingSpaceController();
