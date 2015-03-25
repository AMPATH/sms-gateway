var basicAuth = require('basic-auth'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');
/**
 * auth middleware responsible for doing basic authentication
 * for all admin REST apis
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
var auth = function (req, res, next) {
  var user = basicAuth(req);

  if (user) {
    User.authorize(user.name,user.pass,function(err,usr){
      if (err) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
      }
      // If the authentication is successful then assign the admin user object in request
      req.user = usr;
      next();
    });
  }else{
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  }
};

module.exports=auth;
