var express = require('express'),
    mongoose = require('mongoose'),
    Application = mongoose.model('Application'),
    Message = mongoose.model('Message'),
    auth = require('../../lib/admin-auth'),
    router = express.Router(),
    moment = require('moment'),
    validate = require("validate.js"),
    User = mongoose.model('User');

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
    res.render('admin-ui/index', {
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
    Application.find({}).sort({name: 1}).exec(function(err,applications){
        if (err) return errorHandler(500,err,res);
        res.render('admin-ui/applications',{
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
            Message.find({appName: req.params.name},function(err,messagesSentByThisApp){

                  if(messagesSentByThisApp){
                        messages = messagesSentByThisApp;
                  }else{
                        messages = [];
                  }

                  return  res.render('admin-ui/application',{
                                                             title: 'SMS Gateway',
                                                             app: application,
                                                             menu: 'application',
                                                             moment: moment,
                                                             messages : messagesSentByThisApp
                                                             });
            });
        }else{
          res.render('admin-ui/error',{
                                      error : { status : 500},
                                      title: 'SMS Gateway',
                                      menu: 'application',
                                      message : 'Unable to get application details'});
                                      return;
        }

    });

});

/**
 * Message view page
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.get('/message/:id', function (req, res, next) {

    Message.findById(req.params.id,function(err,messageObj){

          if (err) {
                  res.render('admin-ui/error',{
                            error : { status : 500},
                            menu: 'register',
                            title: 'SMS Gateway',
                            message : 'Unable to get message details.'});
                            return;
                   }

          if(messageObj){
                            res.render('admin-ui/message',{
                               title: 'SMS Gateway',
                               menu: 'application',
                               moment: moment,
                               messageDetails :messageObj
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
  return (typeof x === 'number') && (Math.round(x) === x) && (x > 0);
}

/**
 * Register application view page
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.get('/register', function (req, res, next) {
    res.render('admin-ui/register',{
                                   title: 'Register a new application',
                                   menu: 'register'
               });
});




/**
 * Register a new application
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.post('/application', function(req,res,next){
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
          "secret": {
                    presence: true
                    }

     };

    var err = validate(req.body,validation);
    if(err){
        res.render('admin-ui/error',{
                            error : { status : 500},
                            title: 'SMS Gateway',
                            menu: 'register',
                            message : 'Please enter a valid application name. Name can contain alphanumeric,- and _ only'});
                            return;
    }

    application = new Application({name: req.body.name, secret: req.body.secret, active: true, send: {limit: 200000, count: 0}});
      application.save(function(err,app){
        if (err) {
        res.render('admin-ui/error',{
                  error : { status : 500},
                  menu: 'register',
                  title: 'SMS Gateway',
                  message : 'Unable to register application.'});
                  return;
              }

        if(application){
                  res.render('admin-ui/application',{
                     title: 'SMS Gateway',
                     app: application,
                     menu: 'application',
                     messages : []
                     });
         }
      });
});

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
        res.render('admin-ui/error',{
                            error : { status : 500},
                            title: 'SMS Gateway',
                            menu: 'application',
                            message : 'Limit should be a number greater than 0'});
                            return;
    }
    var update = {'send.limit': newLimit};
    var options = {new: true};
    Application.findOneAndUpdate(query, update, options, function(err, application) {
      if (err) {
        res.render('admin-ui/error',{
          error : { status : 500},
          menu: 'application',
          title: 'SMS Gateway',
          message : 'Unable to update limit'});
          return;
      }
      if(application){
          Message.find({appName: req.params.name},function(err,messagesSentByThisApp){

                            if(messagesSentByThisApp){
                                  messages = messagesSentByThisApp;
                            }else{
                                  messages = [];
                            }

                            return  res.render('admin-ui/application',{
                                                                       title: 'SMS Gateway',
                                                                       app: application,
                                                                       menu: 'application',
                                                                       moment: moment,
                                                                       messages : messagesSentByThisApp
                                                                       });
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
                res.render('admin-ui/password',{
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

    var validation={
              "old_password": {presence: true,
                      },
              "new_password": {
                        presence: true
                        }
    };

    var err = validate(req.body,validation);

        if (err){
           res.render('admin-ui/error',{
                     error : { status : 500},
                     menu: 'application',
                     title: 'SMS Gateway',
                     message : 'Password is required'});
                     return;
        }

    User.compareOldPassword(user.name,req.body.old_password,function(err,usr){
      if (err) {
         res.render('admin-ui/error',{
                              error : { status : 500},
                              menu: 'application',
                              title: 'SMS Gateway',
                              message : 'The password you have supplied is incorrect.'});
                              return;
         }

        usr.password = req.body.new_password;
              usr.save(function(err,app){
                if (err) {
                    res.render('admin-ui/error',{
                                         error : { status : 500},
                                         menu: 'application',
                                         title: 'SMS Gateway',
                                         message : 'Unable to change password.'});
                                         return;
                }
                res.render('admin-ui/index',{
                                            title: 'SMS Gateway'
                                       });
        });
});

});
