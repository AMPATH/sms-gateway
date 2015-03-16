

var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});

var app = express();

var provider = require('./provider/provider');
var oxygen = require('./provider/oxygen8');

if(!provider.register(oxygen)){
  console.log("Unable to register provider. Please check the provider is valid or not!");
  process.exit(1);
}

require('./config/express')(app, config,provider);

// Loading seed data
require('./lib/seed');

app.listen(config.port);

module.exports = app;
