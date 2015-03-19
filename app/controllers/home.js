var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/home', router);
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
