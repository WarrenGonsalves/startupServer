#!/bin/env node


var Hapi = require('hapi');
var fs = require('fs');
var routes = require('./routes');
var config = require('./config/constants');
var db = require('./db');
var util = require('./util');

/**
 *  Define the server application.
 */
var FixerApp = function() {

  //  Scope.
  var self = this;


  /*  ================================================================  */
  /*  Helper functions.                                                 */
  /*  ================================================================  */

  /**
   *  Set up server IP address and port # using env variables/defaults.
   */
  self.setupVariables = function() {
    //  Set the environment variables we need.
    self.ipaddress = config.server.ip;
    self.port = config.server.port;

    console.log('SERVER: setting ip %s, port %s, env %s', self.ipaddress, self.port, config.env);
  };

  /**
   *  Populate the cache.
   */
  self.populateCache = function() {
    if (typeof self.zcache === "undefined") {
      self.zcache = {
        'index.html': ''
      };
    }

    //  Local cache for static content.
    self.zcache['index.html'] = fs.readFileSync('./index.html');
  };


  /**
   *  Retrieve entry (content) from cache.
   *  @param {string} key  Key identifying content to retrieve from cache.
   */
  self.cache_get = function(key) {
    return self.zcache[key];
  };


  /**
   *  terminator === the termination handler
   *  Terminate server on receipt of the specified signal.
   *  @param {string} sig  Signal to terminate on.
   */
  self.terminator = function(sig) {
    if (typeof sig === "string") {
      console.log('%s: Received %s - terminating sample app ...',
        Date(Date.now()), sig);
      process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()));
  };


  /**
   *  Setup termination handlers (for exit and a list of signals).
   */
  self.setupTerminationHandlers = function() {
    //  Process on exit and signals.
    process.on('exit', function() {
      self.terminator();
    });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGTERM'
    ].forEach(function(element, index, array) {
      process.on(element, function() {
        self.terminator(element);
      });
    });
  };


  /*  ================================================================  */
  /*  App server functions (main app logic here).                       */
  /*  ================================================================  */

  /**
   *  Create the routing table entries + handlers for the application.
   */
  self.createRoutes = function() {
    // Add all the routes within the routes folder
    for (var route in routes) {
      self.server.route(routes[route]);
      console.log(route);
    }
  };


  /**
   *  Initialize the server (express) and create the routes and register
   *  the handlers.
   */
  self.initializeServer = function() {
    self.server = new Hapi.Server({ debug: { request: ['error'] } });
    self.server.connection({ 
          host: self.ipaddress, 
          port: self.port 
      });

    self.createRoutes();
    
    // var table = self.server.table();
    // console.log(table[0].table)
    // self.io = require('socket.io')(self.server.listener);
  };

  self.logRequests = function() {
    // Print some information about the incoming request for debugging purposes
    self.server.ext('onRequest', function(request, next) {

      // if ("a_cutie" == request.headers.app_key) {
        if (request.path.indexOf('/admin/') > -1) {
          return next();
        } else {
          util.logger.info("server.onRequest", [request.path, request.query, request.params]);
          return next();
        }
      // } else {
      //   console.log("not a valid key for request");
      //   // dont call next just return from here.
      //   return next.error = "not valid";
      // }

    });
  }

  /**
   *  Initializes the sample application.
   */
  self.initialize = function() {
    self.setupVariables();
    // self.populateCache();
    self.setupTerminationHandlers();

    // Create the express server and routes.
    self.initializeServer();
    // self.logRequests();
  };

  /**
   *  Start the server (starts up the sample application).
   */
  self.start = function() {
    //  Start the app on the specific interface (and port).
    console.log('%s: Node server started.', Date(Date.now()));
    self.server.start();
  };

  self.ioStart = function () {
    // self.io.on('connection', function (socket) {

    //   console.log("someone connected!!!")
    //   // console.log(socket.id);
    //   console.log(socket);
    //   socketHandler.newConnection(socket);
    //   var data = "test data sent via handler";
    //   socket.on('payByWallet', socketHandler.payByWallet);
    //   socket.on('newMessage', socketHandler.newMessage);
    //   socket.on('disconnect', socketHandler.disconnect);
    //   // socket.on('something', function (msg) {
    //   //     console.log("message from: " + socket.id);
    //   //     console.log(msg);

    //   //     socket.emit("reply", 'Excuse you!');
    //   // });

    // });
  }
  
};



/**
 *  main():  Main code.
 */
var server = new FixerApp();
server.initialize();
server.start();
// server.ioStart();

// util.sockets.start(server.io);

module.exports = server;