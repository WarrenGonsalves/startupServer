var db = require('../db');
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config/constants');

var io = {};

module.exports.start = function(ioServer) {
	// io = require('socket.io')(server.listener);
	ioServer.on('connection', function (socket) {

    console.log("someone connected!!!")
    // console.log(socket.id);
    console.log(socket.id);
    newConnection(socket);
    // var data = "test data sent via handler";
    // socket.on('payByWallet', socketHandler.payByWallet);
    // socket.on('newMessage', socketHandler.newMessage);
    socket.on('disconnect', function () {
    	console.log(socket.id+" has disconnected")
	
      // console.log(self.io.sockets.connected);
			// var socket = this;

			db.connection.findOne({socketIds:socket.id}, function (err, connection) {
				if (err) {
		    		return console.log(err)
		    	};	
		    	if (!connection) {
		    		console.log("No connection for socketId: "+socket.id);
		    	} else {
		    		var index = connection.socketIds.indexOf(socket.id);
		    		connection.socketIds.splice(index, 1);
		    		connection.save();
		    	};
			})
    });
    // socket.on('something', function (msg) {
    //     console.log("message from: " + socket.id);
    //     console.log(msg);

    //     socket.emit("reply", 'Excuse you!');
    // });

  });
  io = ioServer;
};



module.exports.adminRequestValidatePaycode = function (studio, data, cb) {
	console.log(io)
	db.connection.find({isAdmin: true}, function (err, connections) {
		if (err) {
			cb({status:400, message: err})
  		return console.log(err)
  	};
  	if (!connections) {
  		db.connection.findOne({studio:studio}, function (err, connection) {
  			if (err) {
		  		return console.log(err)
		  	};
		  	for (var j = 0; j < connection.socketIds.length; j++) {
  				console.log(connections[i].socketIds[j]);
  				if (io.sockets.connected[connections[i].socketIds[j]])
  					io.sockets.connected[connections[i].socketIds[j]].emit("toast", "No admins connected");
  			}
  		})
  		return cb({status:400, message: "No admins connected"})
  	}else {
  		for (var i = 0; i < connections.length; i++) {
  			var id = "";
  			for (var j = 0; j < connections[i].socketIds.length; j++) {
  				console.log(connections[i].socketIds[j]);
  				if (io.sockets.connected[connections[i].socketIds[j]])
  					io.sockets.connected[connections[i].socketIds[j]].emit("validatePaycode", data);
  			}
  		};
  		return cb({status:200, message: "Notification sent to Admin"})
  	};
	})
}

module.exports.studioRequestCompletePayment = function (studio, data, cb) {
	console.log(io)
	db.connection.findOne({studio: studio}, function (err, connection) {
		if (err) {
			cb({status:400, message: err})
  		return console.log(err)
  	};
  	if (!connection) {
  		// db.connection.find({studio:source}, function (err, connection) {
  		// 	if (err) {
		  // 		return console.log(err)
		  // 	};
		  // 	for (var j = 0; j < connection.socketIds.length; j++) {
  		// 		console.log(connections[i].socketIds[j]);
  		// 		if (io.sockets.connected[connections[i].socketIds[j]])
  		// 			io.sockets.connected[connections[i].socketIds[j]].emit("toast", "No admins connected");
  		// 	}
  		// })
  		return cb({status:400, message: "Studio not connected"})
  	}else {
			for (var j = 0; j < connection.socketIds.length; j++) {
				console.log(connection.socketIds[j]);
				if (io.sockets.connected[connection.socketIds[j]])
					io.sockets.connected[connection.socketIds[j]].emit("completePayment", data);
			}
  		return cb({status:200, message: "Notification sent to Studio"})
  	};
	})
}

function newConnection (socket) {

    console.log("new newConnection");
    console.log(socket.request._query['auth']);
    ensureAuthenticatedStudio(socket.request._query['auth'] , function (studio) {
    	console.log("authenticated")
    	console.log(studio)
	    db.connection.findOne({studio:studio.id}, function (err, connection) {
	    	if (err) {
	    		return console.log(err)
	    	};
	    	if (!connection) {
	    		// create new connection
	    		var newStudioConnection = new db.connection();
	    		newStudioConnection.studio = studio.id;
	    		newStudioConnection.isAdmin = studio.isAdmin;
	    		newStudioConnection.socketIds = [];
	    		newStudioConnection.socketIds.push(socket.id);
	    		newStudioConnection.save();
	    	} else {
	    		// existing connection
	    		if(connection.socketIds.indexOf(socket.id) < 0) {
	    			connection.socketIds.push(socket.id)
	    			connection.save();
	    		}
	    	};

	    })
    })
};

module.exports.sendNewBooking = function (booking) {
  // db.booking.findById(booking_id)
  // .populate('cust_id', 'name ph')
  // .populate('services.practitioners', 'name')
  // .exec(function (err, booking) {
    // if (err) {
    //   return console.log(err)
    // };
    if (!booking) {
      console.log("booking empty");
    }else {
      db.connection.find().or([{isAdmin: true}, { studio: booking.studio_id }])
      .exec(function (err, connections) {
        if (err) {
          return console.log(err)
        };  
        if (!connections) {
          console.log("no connections");
        }else {
          for (var i = 0; i < connections.length; i++) {
            var id = "";
            for (var j = 0; j < connections[i].socketIds.length; j++) {
              console.log(connections[i].socketIds[j]);
              if (io.sockets.connected[connections[i].socketIds[j]])
                io.sockets.connected[connections[i].socketIds[j]].emit("bookingStatusChange", booking);
            }
          };
        };
      })
    };
  // })
}

function disconnect (socket) {
	console.log(socket.id+" has disconnected")
	
      // console.log(self.io.sockets.connected);
	// var socket = this;

	db.connection.findOne({socketIds:socket.id}, function (err, connection) {
		if (err) {
    		return console.log(err)
    	};	
    	if (!connection) {
    		console.log("No connection for socketId: "+socket.id);
    	} else {
    		var index = connection.socketIds.indexOf(socket.id);
    		connection.socketIds.splice(index, 1);
    		connection.save();
    	};
	})
};

function ensureAuthenticatedStudio (auth, cb) {
  if (!auth) {
    return console.log('You need to login to do that');
  }
  var token = auth;

  var payload = null;
  try {
    payload = jwt.decode(token, config.tokenSecret);
  }
  catch (err) {
    return console.log(err);
  }

  if (payload.exp <= moment().unix()) {
    return console.log('Token has expired. Please login again.');
  }
  user = payload.sub;
  db.studio.findById(user, function (err, studio) {
    if (err) {
      return console.log(err);
    }else if (!studio) {
      return console.log("Invalid token");
    }else
      return cb({id:user,isAdmin: studio.isAdmin});
  })
  // util.reply.authFail('Wrong email and/or password', reply);
};
module.exports.io = io;