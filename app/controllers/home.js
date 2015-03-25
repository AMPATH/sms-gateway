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
        applicationsList : applications,
        menu: 'application'
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
        if(application){
          return  res.render('application',{
                    title: 'SMS Gateway',
                    app: application,
                    menu: 'application'
                    });
        }

        return res.status(404).send('Not found');
    });
});


/**
 * isInteger - check whether the input data is an integer type or not
 *
 * @param  {object} x input data for checking
 * @return {boolean} true if it is integer otherwise false.
 */
function isInteger(x) {
  return (typeof x === 'number') && (Math.round(x) === x) && (x > 0);
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
                            title: 'SMS Gateway',
                            menu: 'application',
                            message : 'Limit should be a number greater than 0'});
                            return;
    }
    console.log(newLimit);
    var update = {'send.limit': newLimit};
    var options = {new: true};
    Application.findOneAndUpdate(query, update, options, function(err, application) {
      if (err) {
        res.render('error',{
          error : { status : 500},
          menu: 'application',
          title: 'SMS Gateway',
          message : 'Unable to update limit'});
          return;
      }
      if(application){
              res.render('application',{
             title: 'SMS Gateway',
             app: application,
             menu: 'application'
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
