var db = require('../db');
var _ = require('underscore');
var util = require('../util');
var AccessControlController = require('../controller/accessControl');
var validator = require('email-validator');

function UserController() {};


UserController.prototype.getUserList = function(request, reply) {
  var requestRights = {
    task: "R_USER"
  }
  console.log("In UserController getUserList");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      var query_param = {}
      
      db.user.find(query_param)
      .select("userName email phone")
      .exec(function(err, userList) {
        if (err) {
          util.reply.error(err, reply);
          return;
        }

        reply({
          userList: userList
        });
      }); 
      
    }else return util.reply.error("Unauthorized", reply);
    
  })
};


UserController.prototype.changeUserName = function(request, reply) {
  var requestRights = {
    task: "CH_USER"
  }
  console.log("In UserController changeUserName");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      if (request.payload.userName === undefined)
          return util.reply.error("Invalid user name", reply);
      db.user.findById(request.pre.user._id, function(err, user) {
        if (err) return util.reply.error(err, reply);
        user.userName = request.payload.userName
        user.save(function (err, user) {
          if (err) {
              util.logger.err("user", ["user save error", err]);
              util.reply.error(err, reply);
          };
          reply(user);
        });
      })
      
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

UserController.prototype.changePhone = function(request, reply) {
  var requestRights = {
    task: "CH_USER"
  }
  console.log("In UserController changePhone");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      if ((!isNumber(request.payload.phone)) || request.payload.phone === undefined)
          return util.reply.error("Invalid user phone", reply);
      db.user.findById(request.pre.user._id, function(err, user) {
        if (err) return util.reply.error(err, reply);
        user.phone = request.payload.phone
        user.save(function (err, user) {
          if (err) {
              util.logger.err("user", ["user save error", err]);
              util.reply.error(err, reply);
          };
          reply(user);
        });
      })
      
    }else return util.reply.error("Unauthorized", reply);
    
  })
};

UserController.prototype.changeEmail = function(request, reply) {
  var requestRights = {
    task: "CH_USER"
  }
  console.log("In UserController changeEmail");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      if (request.payload.email === undefined || !validator.validate(request.payload.email))
          return util.reply.error("Invalid user email", reply);
      db.user.findById(request.pre.user._id, function(err, user) {
        if (err) return util.reply.error(err, reply);
        user.email = request.payload.email
        user.save(function (err, user) {
          if (err) {
              util.logger.err("user", ["user save error", err]);
              util.reply.error(err, reply);
          };
          reply(user);
        });
      })
      
    }else return util.reply.error("Unauthorized", reply);
    
  })
};


UserController.prototype.deleteUser = function(request, reply) {
  var requestRights = {
    task: "DEL_USER"
  }
  console.log("In UserController deleteUser");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      
      db.user.findById(request.params.userId, function (err, user) {
        if (err) return util.reply.error(err, reply);
        if ((rights.result.viewLevel > 3) || ((rights.result.viewLevel > 2) && request.pre.user.coworkingId.equals(user.coworkingId))) {
           db.user.findById(request.params.userId).remove(function (err, result) {
              if (err) return util.reply.error(err, reply);
              console.log(result);
              if (result.result.n) {
                  reply(true);
              }else reply(false);  
          })
        } else return util.reply.error("Unauthorized", reply);
      })
      
    }else return util.reply.error("Unauthorized", reply);
    
  })
};


function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n) && n > -1;
}
module.exports = new UserController();