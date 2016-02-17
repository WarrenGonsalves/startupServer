var db = require('../db');
var _ = require('underscore');
var util = require('../util');
var AccessControlController = require('../controller/accessControl');

function PlanController() {};

PlanController.prototype.getPlans = function(request, reply) {
  var requestRights = {
    task: "R_PLANS"
  }
  console.log("In PlanController getConfigHandler");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
  console.log("rights returned");
    console.log(rights.status);
    console.log(rights);
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      var query_param = {}
      if (!request.query.coworkingId) 
        request.query.coworkingId = request.pre.user.coworkingId;       //default to users coworkingId
      if (request.pre.user.coworkingId.equals(request.query.coworkingId)) {
        query_param['visibility'] = {$lte: rights.result.viewLevel};
        if (rights.result.viewLevel < 3) {
          query_param['active'] = {$eq: true};
        };
        if (rights.result.viewLevel < 5) {
          query_param['coworkingId'] = {$eq: request.query.coworkingId};
        };
      }else {
        query_param['visibility'] = {$lte: 1};
        query_param['active'] = {$eq: true};
        query_param['coworkingId'] = {$eq: request.query.coworkingId};
      };
      
      db.plan.find(query_param).exec(function(err, planList) {
        if (err) {
          util.reply.error(err, reply);
          return;
        }

        reply({
          planList: planList
        });
      });  
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

PlanController.prototype.addPlan = function(request, reply) {
  var requestRights = {
    task: "ADD_PLAN"
  }
  console.log("In PlanController addPlan");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      if (request.payload.name === undefined)
          return util.reply.error("Invalid plan name", reply);
      
      if (request.payload.amenities) {
          if (request.payload.amenities.seats < 1)
              return util.reply.error("Invalid number of seats", reply);
      }
      var plan = new db.plan({
          name: request.payload.name,
          coworkingId: request.pre.user.coworkingId,
          visibility: request.payload.visibility,
          active: request.payload.active,
          amenities: {
              seats: request.payload.amenities.seats,
              coffee: request.payload.amenities.coffee,
              printerPaper: request.payload.amenities.printerPaper
          }
      });

      plan.save(function (err, plan) {
          if (err) {
              util.logger.err("plan", ["plan save error", err]);
              util.reply.error(err, reply);
          };
          reply(plan);
      });
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

PlanController.prototype.updatePlan = function(request, reply) {
  var requestRights = {
    task: "UPD_PLAN"
  }
  console.log("In PlanController updatePlan");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      if (request.params.planId === undefined)
          return util.reply.error("Need plan ID", reply);
      if (request.payload.amenities) {
          if (request.payload.amenities.seats < 1)
              return util.reply.error("Invalid number of seats", reply);
      }
      db.plan.findById(request.params.planId, function (err, plan) {
          if (err) return util.reply.error(err, reply);
          if (!plan) return util.reply.error("Invalid plan ID", reply);
          console.log(plan.coworkingId)
          console.log(request.pre.user._id)
          // if (!(plan.coworkingId.equals(request.pre.user._id))) return util.reply.error("Unauthorized", reply);
          plan.name = request.payload.name;
          plan.visibility = request.payload.visibility;
          plan.active = request.payload.active;
          plan.amenities = {
              seats: request.payload.amenities.seats,
              coffee: request.payload.amenities.coffee,
              printerPaper: request.payload.amenities.printerPaper
          };
          plan.save(function (err, plan) {
              if (err) {
                  util.logger.err("plan", ["plan save error", err]);
                  util.reply.error(err, reply);
              };
              reply(plan);
          });
      })
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

PlanController.prototype.deletePlan = function(request, reply) {
    console.log();
    if (request.params.planId === undefined)
        return util.reply.error("Need plan ID", reply);
    
    db.plan.findById(request.params.planId).remove(function (err, result) {
        if (err) return util.reply.error(err, reply);
        console.log(result);
        if (result.result.n) {
            reply(true);
        }else reply(false);        
    })

};

PlanController.prototype.selectPlan = function(request, reply) {
  var requestRights = {
    task: "SEL_PLAN"
  }
  console.log("In PlanController selectPlan");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      
    }else return util.reply.error("Unauthorized", reply);
    
  })
}


module.exports = new PlanController();