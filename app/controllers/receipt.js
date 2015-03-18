var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/receipt', router);
};

router.post('/', function (req, res, next) {
    var provider = req.locals.provider;

    if(provider.isSupportCallback){
        provider.processCallback(req,res,next);
    }
});


