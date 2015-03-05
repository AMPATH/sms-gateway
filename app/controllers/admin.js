var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    Application = mongoose.model('Application');

module.exports = function (app) {
    app.use('/admin', router);
};

router.get('/application',function(req, res, next){
  res.status(200).send("[]");
});


router.post('/application',function(req,res,next){
  application = new Application({name: req.body.name, secret: req.body.secret, active: true, send: {limit: 200000, count: 0}});
  application.save(function(err,app){
    if (err) return errorHandler(400,err,res);
    res.status(201).send(app.toJSON());
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
