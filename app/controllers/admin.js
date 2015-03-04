var express = require('express'),
    router = express.Router();

/*
GET  /admin/application
POST /admin/application
GET  /admin/application/:appname
POST /admin/application/:appname/limit
POST /admin/application/:appname/activate
POST /admin/application/:appname/deactivate
DELETE /admin/application/:appname
*/

module.exports = function (app) {
    app.use('/admin', router);
};


router.get('/application',function(req, res, next){
  res.status(200).send("[]");
});
