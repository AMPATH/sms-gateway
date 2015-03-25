var express = require('express'),
    mongoose = require('mongoose'),
    Application = mongoose.model('Application'),
    auth = require('../../lib/admin-auth'),
    router = express.Router(),
    validate = require("validate.js");

module.exports = function (app) {
    app.use('/admin-ui',auth, router);
};


/**
 * Home page
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'SMS Gateway',
    });
});

/**
 * Applications view page
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.get('/applications', function (req, res, next) {
    Application.find(function(err,applications){
        if (err) return errorHandler(500,err,res);
        res.render('applications',{
        title: 'SMS Gateway',
        applicationsList : applications
        });
      });

});

/**
 * Detailed application view page
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.get('/application/:name', function (req, res, next) {
    Application.findOne({name: req.params.name},function(err,application){
        if (err) return errorHandler(404,err,res);
        if(application){
            res.render('application',{
                    title: 'SMS Gateway',
                    name : application.name,
                    active : application.active,
                    limit: application.send.limit,
                    count: application.send.count
                    });
        }
    });
});

/**
 * Disable application
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
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
              console.log(application);
              res.render('application',{
                                  title: 'SMS Gateway',
                                  name : application.name,
                                  active : application.active,
                                  limit: application.send.limit,
                                  count: application.send.count
                                  });
      }
    });
});

/**
 * Enable application
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
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
              res.render('application',{
                                  title: 'SMS Gateway',
                                  name : application.name,
                                  active : application.active,
                                  limit: application.send.limit,
                                  count: application.send.count
                                  });
      }
    });
});

/**
 * isInteger - check whether the input data is an integer type or not
 *
 * @param  {object} x input data for checking
 * @return {boolean} true if it is integer otherwise false.
 */
function isInteger(x) {
  return (typeof x === 'number') && (Math.round(x) === x);
}

/**
 * Change application limit
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.post('/application/:name/limit', function(req,res,next){

    var query = {name: req.params.name};
    var newLimit = req.body.limit;
    if(!isInteger(Number(newLimit))){
        res.render('error',{
                            error : { status : 500},
                            message : 'Limit should be a number'});
       // return errorHandler(404,"Limit should be a number",res);
    }
    var update = {'send.limit': newLimit};
    var options = {new: true};

    Application.findOneAndUpdate(query, update, options, function(err, application) {
      if (err) {
        res.render('error',{
                                    error : { status : 500},
                                    message : 'Unable to update limit'});
        //return errorHandler(404,err,res);
      }
      if(application){
              res.render('application',{
                                                 title: 'SMS Gateway',
                                                 name : application.name,
                                                 active : application.active,
                                                 limit: application.send.limit,
                                                 count: application.send.count
                                                 });
      }
    });
});

/**
 * Change admin password page
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.get('/change', function(req,res,next){
                res.render('password',{
                                            title: 'Change password'
                                       });
});

/**
 * Change admin password
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.post('/password', function(req,res,next){
    var user = req.user;
    var err = validate({password : req.body.new_password}, {password: {presence: true}});

        if (err){
            return errorHandler(400,err.password.join(),res);
        }

        user.password = req.body.new_password;
              user.save(function(err,app){
                if (err) {
                    return errorHandler(400,"Unable to update password for user '" + user.name + "'",res);
                }
                res.render('index',{
                                            title: 'SMS Gateway'
                                       });
        });
});
