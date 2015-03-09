var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    basicAuth = require('basic-auth'),
    Application = mongoose.model('Application'),
    User = mongoose.model('User');


module.exports = function (app) {
    app.use('/admin', router);
};


var auth = function (req, res, next) {
  var user = basicAuth(req);

  if (user) {
    User.authorize(user.name,user.pass,function(err,usr){
      if (err) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.status(401);
      }
      req.user = usr;
      next();
    });
  }else{
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  }

};


router.get('/application',auth,function(req, res, next){
  Application.find(function(err,applications){
    if (err) return errorHandler(500,err,res);
    res.status(200).json(applications);
  });
});


router.post('/application',function(req,res,next){
  application = new Application({name: req.body.name, secret: req.body.secret, active: true, send: {limit: 200000, count: 0}});
  application.save(function(err,app){
    if (err) return errorHandler(400,err,res);
    res.status(201).json(app.toJSON());
  });
});

router.get('/application/:name',function(req, res, next){
  Application.findOne({name: req.params.name},function(err,application){
    if (err) return errorHandler(404,err,res);
    if(application){
        return res.status(200).json(application);
    }

    return res.status(404).send("Unable to find application with name '"+req.params.name+"'");
  });
});

//POST /admin/application/{appName}/disable

router.post('/application/:name/disable', function(req,res,next){
    var query = {name: req.params.name, active: 'true'};
    var update = {active: 'false'};
    var options = {new: true};

    Application.findOneAndUpdate(query, update, options, function(err, application) {
      if (err) {
        return errorHandler(404,err,res);
      }
      if(application){
              return res.status(200).json(application);
      }
      return res.status(404).send("Unable to find and disable application '"+req.params.name+"'");
    });
});

//POST /admin/application/{appName}/enable

router.post('/application/:name/enable', function(req,res,next){
    var query = {name: req.params.name, active: 'false'};
    var update = {active: 'true'};
    var options = {new: true};

    Application.findOneAndUpdate(query, update, options, function(err, application) {
      if (err) {
        return errorHandler(404,err,res);
      }
      if(application){
              return res.status(200).json(application);
      }
      return res.status(404).send("Unable to find and enable application '"+req.params.name+"'");
    });
});

//POST /admin/application/{appName}/limit

router.post('/application/:name/limit', function(req,res,next){
    var query = {name: req.params.name};
    var newLimit = req.body.limit;
    if(!isInteger(newLimit)){
        return errorHandler(404,"Limit should be a number",res);
    }
    var update = {'send.limit': newLimit};
    var options = {new: true};

    Application.findOneAndUpdate(query, update, options, function(err, application) {
      if (err) {
        return errorHandler(404,err,res);
      }
      if(application){
              return res.status(200).json(application);
      }
      return res.status(404).send("Unable to find and change sms limit for application '"+req.params.name+"'");
    });
});


function errorHandler(code,err,res){
  var messages=err;
  if (typeof err.errors != 'undefined'){
    messages = _.map(err.errors,function(value, field){
      return value.message;
    }).join();
  }
  res.status(code).send(messages);
}

function isInteger(x) {
return (typeof x === 'number') && (Math.round(x) === x);
}
