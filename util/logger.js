var _ = require('underscore');
var db = require('../db');

function createLog(level, tag, log, data_obj) {
    var logger = new db.logger();
    logger.level = level;
    logger.tag = tag;
    logger.created_date = Date.now();
    logger.log = "";

    if (log instanceof Array) {
        _.each(log, function(log) {
            logger.log = logger.log + " : " + JSON.stringify(log);
        });
    } else {
        logger.log = JSON.stringify(log);
    }

    logger.data = JSON.stringify(data_obj);
    logger.save();
    console.log(Date.now(), tag, log);
}

module.exports.info = function(tag, log, data_obj) {
    createLog('info', tag, log, data_obj);
};

module.exports.debug = function(tag, log, data_obj) {
    createLog('debug', tag, log, data_obj);
};

module.exports.err = function(tag, log, data_obj) {
    createLog('err', tag, log, data_obj);
}