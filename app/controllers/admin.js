var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    Application = mongoose.model('Application'),
    auth = require('../../lib/admin-auth'),
    validate = require("validate.js");


/**
 * export admin routes to the application.
 * All the admin related rest api urls are under
 * /admin path.
 *
 * @param  {object} express application object
 */
module.exports = function (app) {
    app.use('/admin',auth, router);
};

/**
 * GET /admin/application.
 *
 * This api responds with all the registered applications.
 */
router.get('/application',function(req, res, next){
  Application.find(function(err,applications){
    if (err) return errorHandler(500,err,res);
    res.status(200).json(applications);
  });
});


/**
 * POST /admin/application
 *
 * This api is for creating a new application
 * It expects json data with the application name and secret of application.
 * e.g
 * {
 *  "name": "application_name",
 *  "secret": "application secret"
 * }
 *
 */
router.post('/application',function(req,res,next){
  var validation={
      "name": {presence: true,
                format: {
                      pattern: /^[ A-Za-z0-9_-]*$/,
                      message: "can contain alphanumeric - and _ symbols only"
                },
                length: {
                      maximum: 256,
                      message: "must not be more than 256 chars long"
                }
              },
      "secret": {presence: true,

                }
    };

    var err = validate(req.body,validation);

    if(err){
      return res.status(400).send(err);
    }

  application = new Application({name: req.body.name, secret: req.body.secret, active: true, send: {limit: 200000, count: 0}});
  application.save(function(err,app){
    if (err) return errorHandler(400,err,res);
    res.status(201).json(app.toJSON());
  });
});


/**
 * GET /admin/application/<application_name>
 *
 * This api is for getting details of an individual application
 * by specifying its name.
 */
router.get('/application/:name',function(req, res, next){
  Application.findOne({name: req.params.name},function(err,application){
    if (err) return errorHandler(404,err,res);
    if(application){
        return res.status(200).json(application);
    }

    return res.status(404).send("Unable to find application with name '"+req.params.name+"'");
  });
});



/**
 * POST /admin/application/<application_name>/disable
 *
 * API for disabling a specified application.
 *
 */
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

/**
 * POST /admin/application/<application_name>/enable
 *
 * API for enabling a specified application.
 *
 */
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

/**
 * POST /admin/application/<application_name>/limit
 *
 * API for changing the sms limit of a specified application.
 * It expects json data with the new limit as shown below.
 * e.g
 * {
 *  "limit": 20000
 * }
 *
 */
 router.post('/application/:name/limit', function(req,res,next){
    var query = {name: req.params.name};
    var newLimit = req.body.limit;
    var validation={
          "limit": {presence: true}

        };

    var err = validate(req.body,validation);

    if(err){
        return res.status(400).send(err);
    }

    if(!isInteger(newLimit)){
        return errorHandler(400,"Limit should be a number, with value greater than zero",res);
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

/**
 * POST /admin/password
 *
 * API for changing admin user's password
 * It expects json data with new password as shown below.
 * e.g
 * {
 *  "new_password": "this is my new password"
 * }
 *
 */
router.post('/password', function(req,res,next){
    var user = req.user;
    var err = validate({password : req.body.new_password}, {password: {presence: true}});

        if (err){
            return errorHandler(400,err.password.join(),res);
        }

        user.password = req.body.new_password;
              user.save(function(err,app){
                if (err) return errorHandler(400,"Unable to update password for user '" + user.name + "'",res);
                res.status(200).send("Password changed successfully for user '" + user.name +"'");
        });
});

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


/**
 * isInteger - check whether the input data is an integer type or not
 *
 * @param  {object} x input data for checking
 * @return {boolean} true if it is integer otherwise false.
 */
function isInteger(x) {
  return (typeof x === 'number') && (Math.round(x) === x) && (x > 0);
}
