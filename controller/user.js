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

      if (rights.result.viewLevel < 5) {
        query_param['coworkingId'] = {$eq: request.pre.user.coworkingId};
        if (rights.result.viewLevel < 3) {
          query_param['orgUserId'] = {$eq: request.pre.user.orgUserId};
        }
      }else {
        //all users
      };
      
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

UserController.prototype.addUser = function(request, reply) {
  var requestRights;
  var u_type;
  if (request.payload.type === undefined) {
      return util.reply.error("Invalid type", reply);
  }else if (equest.payload.type === "OCO") {
      u_type = "OCO";
      requestRights = {
        task: "INV_USER"
      }
  }else if (equest.payload.type === "COW") {
      u_type = "COW"
      requestRights = {
        task: "ADD_USER"
      }
  }else 
    return util.reply.error("Invalid type", reply);
  console.log("In UserController addUser");

  AccessControlController.validateAccessMid(requestRights, request.pre, function (rights) {
    if (rights.status != 200) return util.reply.error(rights.message, reply);
    if (rights.result.access) {
      if (request.payload.userName === undefined)
        return util.reply.error("Invalid username", reply);
      if (request.payload.email === undefined || !validator.validate(request.payload.email))
        return util.reply.error("Invalid email", reply);
      if (request.payload.phone && !isNumber(request.payload.phone))
        return util.reply.error("Invalid phone", reply);
      
      var u_coworkingId;
      if (rights.result.viewLevel == 5) {           //admin
        if (!request.payload.coworkingId)
          return util.reply.error("Invalid coworkingId", reply);
        if (request.payload.type === u_type && !request.payload.orgUserId)
          return util.reply.error("Invalid orgUserId", reply);
        u_coworkingId = request.payload.coworkingId;
        u_orgUserId = request.payload.orgUserId;
      } else if (rights.result.viewLevel == 3) {    //coworing space manager
        u_coworkingId = request.pre.user.coworkingId;
        if (u_type === "OCO" && !request.payload.orgUserId)
          return util.reply.error("Invalid orgUserId", reply);
        u_orgUserId = request.payload.orgUserId;
      } else if (rights.result.viewLevel == 2 && u_type === "OCO") {    //organization account
        u_coworkingId = request.pre.user.coworkingId;
        u_orgUserId = request.pre.user.orgUserId;
      }
      var user = new db.user({
          userName: request.payload.userName,
          email: request.payload.email,
          phone: request.payload.phone,
          type: u_type,
          coworkingId: u_coworkingId,
          orgUserId: u_orgUserId
      });

      user.save(function (err, user) {
          if (err) {
              util.logger.err("user", ["user save error", err]);
              util.reply.error(err, reply);
          };
          //send email to user
          reply(user);
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