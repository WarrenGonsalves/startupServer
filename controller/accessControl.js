var db = require('../db');
var _ = require('underscore');
var util = require('../util');

function AccessControlController() {};

AccessControlController.prototype.validateAccessMid = function (request, pre, cb) {
    validateAccess(request, pre, function (data) {
        
        return cb(data);
    })
}

function validateAccess (request, pre, cb) {
    console.log("in validateAccess request data")
    console.log(pre.user.type)
    // return cb({
    //         message: "returned message value",
    //         status: 200
    //     }) 
    if (!request.task) return cb({message:"Task needed", status: 400});

    db.accessControl.findOne({type: pre.user.type}, function (err, accessRights) {
        if (err) return cb({message:err, status: 400});
        console.log(accessRights)
        if (!accessRights) return cb({message:"accessRights not found", status: 400});
        console.log(accessRights.permissions.indexOf(request.task))
        if (accessRights.permissions.indexOf(request.task) >= 0) {
            console.log("permissions found")
            var result = {
                access: true,
                viewLevel: accessRights.viewRights
            }
            cb({result, status: 200});
        }
        else{
            var result = {
                access: false,
                viewLevel: null
            }
            cb({result, status: 200});
        }
    })
        
}

module.exports = new AccessControlController();