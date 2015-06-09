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
/**
 * GET /receipt
 *
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.get('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  return  res.status(200).send("Success");
});


/**
 *  OPTIONS /receipt
 *
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.options('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  return  res.status(200).send("Success");
});

/**
 * HEAD /receipt
 *
 *
 * @param  {object} req  http request object
 * @param  {object} res  http response object
 * @param  {callback} next http callback for the next middleware or route
 */
router.head('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  return  res.status(200).send("Success");
});