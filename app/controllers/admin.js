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
  application = new Application({name: req.body.name, secret: req.body.secret, active: true, send: {limit: 2000, count: 0}});
  application.save(function(err){
    if (err) return errorHandler(500,err,res);
    res.status(201).send("created");
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
