var _ = require('underscore'),
    mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    querystring = require('querystring'),
    http = require('http');



function postSMS(phonenumbers,refId,msg,cb){

  // TODO: convert phonenumber to MSISDN

  var postData = querystring.stringify({
    'Channel' : 'UK.VODAFONE',
    'MSISDN'  : phonenumber, // to which phone
    'Content' : msg
  });

  var options = {
    hostname: 'localhost',
    port: 8000,
    path: '/users/sms',
    method: 'POST',
    auth: 'username:password',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      cb(null,chunk);
    });
  });

  req.on('error',function(e){
    cb(e);
  });

  req.write(postData);
  req.end();
}

function parseResult(result){
  console.log(result);
}

var obj={

  handleSMS: function(messageObj,cb){
    var phonenumbers =  _.map(messageObj.messageStatus,function(ph){
      return ph.phonenumber; //convert to 
    });


  }
};


module.exports=obj;
