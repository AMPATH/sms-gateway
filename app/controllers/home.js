var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/home', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'SMS Gateway',
    });
});
