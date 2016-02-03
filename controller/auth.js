var db = require("../db");
var util = require("../util");
// var config = require("../config/constants");
var request_send = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config/constants');
// var secret = require('../config/secrets');
// var config = new secret();
// var bcrypt = require('bcrypt-nodejs');

function AuthController() {};

/*
 |-----------------------------------------------------------
 | Generate JSON Web Token for user
 |-----------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    userName: user.userName,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.tokenSecret);
}

/*
 |-----------------------------------------------------------
 | @Function postLogin
 | POST /auth/login
 | Log in with Email 
 |-----------------------------------------------------------
 */
AuthController.prototype.postLogin = {
    handler: function(request, reply) {
      console.log("login");
      if (!request.payload.key || !request.payload.password) 
        return util.reply.authError('Wrong access credentials', reply);
      var query_param = {};
      var key = request.payload.key;
      if (key.indexOf('@') > 0) {
          query_param['email'] = key;
      } else if (!isNaN(key)) {
          query_param['phone'] = key;
      } else {
        query_param['userName'] = key;
      };
      console.log(query_param)
      console.log(request.payload.password)
      db.user.findOne(query_param, '+password', function(err, user) {
        if (!user) {
          return util.reply.authError('Wrong access credentials', reply);
        }
        // console.log(user);
        // bcrypt.genSalt(10, function(err, salt) {
        //   if (err) return next(err);
        //   bcrypt.hash("sassy", salt, null, function(err, hash) {
        //     console.log(hash);
        //   });
        // });
        user.comparePassword(request.payload.password, function(err, isMatch) {
          if (!isMatch) {
            return util.reply.authError('Wrong access credentials', reply);
          }
          else{
            console.log("LOGIN SUCCESS");
            reply({ token: createJWT(user)});
          }
          
        });
      });
        
    }
};

AuthController.prototype.changePassword = function(request, reply) {
  db.user.findById(request.pre.user,'+password', function(err, user){
      if(err)
          util.reply.error(err, reply);
      else if(!user){
          util.reply.authError('Wrong email and/or password', reply);
      }
      else{
          user.comparePassword(request.payload.oldPassword, function(err, isMatch){
              if(err)
                  util.reply.error(err, reply);
              else if(!isMatch){
                  util.reply.authError("Invalid old password", reply);
              }
              else{
                  user.password = request.payload.newPassword;
                  user.save(function(err, user){
                      if(err)
                          util.reply.error(err, reply);
                      else{
                        if (user.email)
                          util.email.sendPasswordChange(user.name, user.phone);
                        if (user.phone) 
                          util.sms.sendPasswordChange(user.name, user.phone);
                        var result = {
                          message: "Password changed"
                        }
                        reply(result);
                      }
                  });
              }
          });

      }
  });
};

AuthController.prototype.resetPassword = {
  handler: function(request, reply) {
    var query_param = {};
    var key = request.payload.key;
    if (key.indexOf('@') > 0) {
        query_param['email'] = key;
    } else if (!isNaN(key)) {
        query_param['phone'] = key;
    } else return util.reply.authError('Email or mobile required', reply);
    console.log(query_param)
    db.user.findOne(query_param,'+password', function(err, user){
      console.log(user)
      if(err)
          util.reply.error(err, reply);
      else if(!user){
          util.reply.authError('Wrong credentials', reply);
      }
      else{
        var newPassword = makeRandomString(7); 
        user.password = newPassword;
        console.log(newPassword);
        user.save(function(err, user){
            if(err)
                util.reply.error(err, reply);
            else{
              if (user.email)
                util.email.sendPasswordReset(user.name, user.phone, newPassword);
              if (user.phone) 
                util.sms.sendPasswordReset(user.name, user.phone, newPassword);
              var result = {
                message: "Password reset"
              }
              reply(result);
            }
        });
              

      }
    });
  }
}



/*
 |-----------------------------------------------------------
 | Login Required Middleware for user
 |-----------------------------------------------------------
 */
AuthController.prototype.ensureAuthenticatedUser = function (request, reply) {
  if (!request.headers.authorization) {
    return util.reply.authFail('You need to login to do that', reply);
  }
  var token = request.headers.authorization.split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.tokenSecret);
  }
  catch (err) {
    return util.reply.authFail("Invalid token", reply);
  }

  if (payload.exp <= moment().unix()) {
    return util.reply.authFail('Token has expired. Please login again.', reply);
  }
  user = payload.sub;
  db.user.findById(user, function (err, user) {
    if (err) {
      return util.reply.authFail("Invalid token", reply);   
    }else if (!user) {
      return util.reply.authFail("Invalid token", reply);
    }else
      reply(user);
  })
  // util.reply.authFail('Wrong email and/or password', reply);
};

AuthController.prototype.isAdmin = function (request, reply) {
  db.user.findById(request.pre.user, function(err, user){
    if(err)
        util.reply.authFail(err, reply);
    else if(!user){
        util.reply.authFail('User invalid', reply);
    }
    else{
      reply(user.isAdmin);
    }
  });
};

function makeRandomString(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = new AuthController();