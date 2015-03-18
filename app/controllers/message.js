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

router.get('/message/:id',auth,function(req,res,next){
  Message.findById(req.params.id,function(err,message){

      if (err) return errorHandler(404,"Unable to find message with id '"+req.params.id+"'",res);

      if(message){
          return res.status(200).json(message);
      }
      return res.status(404).send("Unable to find message with id '"+req.params.id+"'");
    });
  });

function createMessage(req){
  var msgData = _.pick(req.body,"token","sender","message");

  msgData.messageStatus =  _.map(req.body.recipients,function(number){
    return {"phonenumber": number };
  });

  msgData.appName=req.app.name;

  return new Message(msgData);
}

function errorHandler(code,err,res){
  var messages=err;
  if (typeof err.errors != 'undefined'){
    messages = _.map(err.errors,function(value, field){
      return value.message;
    }).join();
  }
  res.status(code).send(messages);
}
