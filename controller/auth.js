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

/*
 |-----------------------------------------------------------
 | @Function postRegister
 | POST /auth/Register
 | Register with Email 
 |-----------------------------------------------------------
 */
AuthController.prototype.postRegister = {
    handler: function(request, reply) {
      console.log("Register");
      if (!request.payload.email || !request.payload.password) 
        return util.reply.authError('Need email and password', reply);
 
      emailExists(request.payload.email, function(oldEmail) {
        if (oldEmail) {
          return util.reply.authError('Email already exists', reply);
        } else {
          var newUser = new db.user{
            email: request.payload.email,
            Password: request.payload.Password,
            verificationCode: makeRandomString(10)
          }
          newUser.save(function(err, user){
            if(err)
                util.reply.error(err, reply);
            else{
              // if (user.email)
              //   util.email.confirmEmail(user.name, user.email, user.verificationCode);
              // if (user.phone) 
              //   util.sms.sendPasswordChange(user.name, user.phone);
              var result = {
                message: "User created"
              }
              reply(result);
            }
          });
        }
      }
        
    }
};

AuthController.prototype.verifiyEmail = {
    handler: function(request, reply) {
      console.log("verifiyEmail");
      if (!request.params.emailVerificationCode) 
        return util.reply.authError('Need verification code', reply);
 
      db.user.findOne({verificationCode: request.params.emailVerificationCode}, function(err, user) {
        if (err) {
          return util.reply.error(err, reply);
        } else if(!user){
          return util.reply.error("Verification code invalid", reply);
        } else {
          user.isAuth = true;
          user.save(function(err, user){
            if(err)
                util.reply.error(err, reply);
            else{
              // if (user.email)
              //   util.email.confirmEmail(user.name, user.email, user.verificationCode);
              // if (user.phone) 
              //   util.sms.sendPasswordChange(user.name, user.phone);
              var result = {
                message: "Email authenticated"
              }
              reply(result);
            }
          });
        }
      }
        
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
                        // if (user.email)
                        //   util.email.sendPasswordChange(user.name, user.phone);
                        // if (user.phone) 
                        //   util.sms.sendPasswordChange(user.name, user.phone);
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
  db.user.findById(user,'+type', function (err, user) {
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

/*
 |-----------------------------------------------------------
 | @Function postFacebookLogin
 | POST /auth/facebook
 | Login with Facebook
 |-----------------------------------------------------------
 */
AuthController.prototype.postFacebookLogin = {
  handler: function(request, reply) {
    var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
    // var params = {
    //   code: request.body.code,
    //   client_id: request.body.clientId,
    //   client_secret: config.facebook.clientSecret,
    //   redirect_uri: request.body.redirectUri
    // };

    // // Step 1. Exchange authorization code for access token.
    // request_send.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    //   if (response.statusCode !== 200) {
    //     return util.reply.fbAuth(accessToken.error.message, 500, reply);
    //   }
      console.log("-------FB AUTH CONTROLLER-------");
      console.log(request.payload.access_token);
      // Step 2. Retrieve profile information about the current user.
      var path = graphApiUrl + "?access_token=" + request.payload.access_token;
      request_send.get(path, function(error, response, profile) {
        profile = JSON.parse(profile);
        if (response.statusCode !== 200) {
          return util.reply.fbAuth(profile.error.message, 500, reply);
        }
        if (request.headers.authorization) {
          db.user.findOne({ facebookId: profile.id }, function(err, existinguser) {
            if (existinguser) {
              return util.reply.fbAuth('There is already a Facebook account that belongs to you', 409, reply);
            }
            var token = request.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.tokenSecret);
            db.user.findById(payload.sub, function(err, user) {
              if (!user) {
                return util.reply.fbAuth('user not found', 400, reply);
              }
              user.facebook = profile.id;
              user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
              user.name = user.name || profile.name;
              user.email = user.email || profile.email;
              console.log("Profile "+profile.email);
              user.save(function(newUser) {
                var token = createJWTuser(newUser);
                var data = {
                  token: token,
                  phone: user.phone,
                  email: user.email,
                  picture: user.picture
                }
                reply(data);
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
            console.log(profile.id);
          db.user.findOne({ facebook: profile.id }, function(err, existinguser) {
            if (existinguser) {
              var token = createJWTuser(existinguser);
              var data = {
                token: token,
                phone: existinguser.phone,
                email: existinguser.email,
                picture: existinguser.picture
              }
              return reply(data);
            }
            var user = new db.user();
            user.facebook = profile.id;
            user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
            user.name = profile.name;
            user.email = user.email || profile.email;
            user.isAuth = true;
            console.log("Profile "+profile.email);
            user.save(function(err, newUser) {
              var token = createJWTuser(newUser);
              var data = {
                token: token,
                phone: user.phone,
                email: user.email,
                picture: user.picture
              }
              reply(data);
            });
          });
        }
      });
    // });
  }
}


/*
 |-----------------------------------------------------------
 | @Function postGoogleLogin
 | POST /auth/google
 | Login with Google
 |-----------------------------------------------------------
 */
AuthController.prototype.postGoogleLogin = {
  handler: function(request, reply) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    // var params = {
    //   code: req.body.code,
    //   client_id: req.body.clientId,
    //   client_secret: config.google.clientSecret,
    //   redirect_uri: req.body.redirectUri,
    //   grant_type: 'authorization_code'
    // };

    // Step 1. Exchange authorization code for access token.
    // request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
      var accessToken = request.payload.access_token;
      var headers = { Authorization: 'Bearer ' + accessToken };

      // Step 2. Retrieve profile information about the current user.
      request_send.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
        if (profile.error) {
          return util.reply.fbAuth(profile.error.message, 500, reply);
        }
        console.log(profile)
        // Step 3a. Link user accounts.
        if (request.headers.authorization) {
          db.user.findOne({ google: profile.sub }, function(err, existinguser) {
            if (existinguser) {
              return util.reply.fbAuth('There is already a Google account that belongs to you', 409, reply);
            }
            var token = request.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.tokenSecret);
            db.user.findById(payload.sub, function(err, user) {
              if (!user) {
                return util.reply.fbAuth('user not found', 400, reply);
              }
              user.google = profile.sub;
              user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
              user.name = user.name || profile.name;
              user.email = user.email || profile.email;
              user.isAuth = true;
              user.save(function(err, existinguser) {
                var token = createJWTuser(user);
                var data = {
                  token: token,
                  phone: user.phone,
                  email: user.email,
                  picture: user.picture
                }
                reply(data);
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          db.user.findOne({ google: profile.sub }, function(err, existinguser) {
            if (existinguser) {
              var token = createJWTuser(existinguser);
              var data = {
                token: token,
                phone: existinguser.phone,
                email: existinguser.email,
                picture: existinguser.picture
              }
              return reply(data);
            }
            var user = new db.user();
            user.google = profile.sub;
            user.picture = profile.picture.replace('sz=50', 'sz=200');
            user.name = profile.name;    
            user.email = user.email || profile.email;
            user.save(function(err, newUser) {
              var token = createJWTuser(newUser);
              var data = {
                token: token,
                phone: user.phone,
                email: user.email,
                picture: user.picture
              }
              reply(data);
            });
          });
        }
      });
    // });
  }
}

function emailExists(email, cb) {
  var query_param = {};
  query_param['email'] = email;
  user.findOne(query_param, function(err, user) {
    if(err)
      cb(false);
    else if(user)
      cb(true);
    else 
      cb(false);
  })
}

function makeRandomString(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = new AuthController();