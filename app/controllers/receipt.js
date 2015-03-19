var express = require('express'),
    router = express.Router();

/**
* export receipt routes to the application.
* All the receipt related rest api urls are under
* /receipt path.
*
* @param  {object} express application object
*/
module.exports = function (app) {
    app.use('/receipt', router);
};

/**
 * POST /receipt
 *
 * This api is for posting callback data with delivery status information
 * of a message.
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.post('/', function (req, res, next) {
    var provider = req.locals.provider;

    if(provider.isSupportCallback){
        provider.processCallback(req,res,next);
    }
});
