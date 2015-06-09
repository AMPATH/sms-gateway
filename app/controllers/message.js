var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    basicAuth = require('basic-auth'),
    Application = mongoose.model('Application'),
    Message = mongoose.model('Message'),
    validate = require("validate.js");


module.exports = function (app) {
    app.use('/', router);
};

/**
 *  OPTIONS /receipt
 *
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.options('/', function (req, res, next) {
  console.log("OPTIONS IP: " + req.ip);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  return  res.status(200).send("");
});

/**
 * auth middleware responsible for doing basic authentication
 * for all admin REST apis
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
var auth = function (req, res, next) {
  var auth = basicAuth(req);

  if (auth) {
    Application.authenticate(auth.name,auth.pass,function(err,app){
      if (err) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
      }
      req.app = app;
      next();
    });
  }else{
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  }
};

/**
 * POST /message
 *
 * This api is used by an application for sending a new message
 * It expects json data with message details as shown below
 * e.g
 * {
 *    "token" : "one time token to identify individual requests (preventing replaying of messages)",
 *    "sender": {
 *    "name": "Bob Smith",
 *    "id": "121313"
 *  },
 *    "recipients": ["055 0840 7317","0934 861 9007","(0151) 545 1812"],
 *    "message": "This is from new sms-gateway"
 *}
 *
 */
router.post('/message',auth,function(req,res,next){

  var validation={
    "token": {presence: true},
    "sender": {presence: true},
    "recipients": {presence: true},
    "message": {presence: true}
  };

  var err = validate(req.body,validation);

  if(err){
    return res.status(400).send(err);
  }

  var appLimit = req.app.send.limit;

  if(req.body.recipients.length > appLimit){
    return res.status(400).send("Unable to send sms as application '"+req.app.name+"' has reached the allocated sms limit");
  }else if(!req.app.active){
    return res.status(400).send("Unable to send sms as application '"+req.app.name+"' has been disabled");
  }else{
    msg = createMessage(req);
    msg.save(function(err,message){
        if(err) return errorHandler(400,err,res);
        var provider = req.locals.provider;
        provider.handleSMS(message,function(status){
            if (status !== 'failed'){
                var app = req.app;
                var update = { $inc: { 'send.count': message.messageStatus.length }};
                app.update(update,function(err,updated_app){
                    if(err) console.log(err);
                });
            }
        });
        res.status(200).json(message);
    });
  }
});

/**
 * GET /message/<id>
 *
 * This api is for getting details of an individual message
 * by specifying its id.
 */
router.get('/message/:id',auth,function(req,res,next){
  Message.findById(req.params.id,function(err,message){

      if (err) return errorHandler(404,"Unable to find message with id '"+req.params.id+"'",res);

      if(message){
          return res.status(200).json(message);
      }
      return res.status(404).send("Unable to find message with id '"+req.params.id+"'");
    });
  });


/**
 * createMessage - description
 *
 * @param  {object} req the http request object
 * @return {object} message the message object
 */
function createMessage(req){
  var msgData = _.pick(req.body,"token","sender","message");

  msgData.messageStatus =  _.map(req.body.recipients,function(number){
    return {"phonenumber": number };
  });

  msgData.appName=req.app.name;

  return new Message(msgData);
}


/**
 * errorHandler - for handling the error and sending it to the client.
 *
 * @param  {Number} code HTPP code that needs to be sent to the client
 * @param  {error} err  error object
 * @param  {object} res  http response object
 */
function errorHandler(code,err,res){
  var messages=err;
  if (typeof err.errors != 'undefined'){
    messages = _.map(err.errors,function(value, field){
      return value.message;
    }).join();
  }
  res.status(code).send(messages);
}