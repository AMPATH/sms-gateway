var _ = require('underscore'),
    mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    querystring = require('querystring'),
    http = require('http');



function postSMS(phonenumber,refId,msg,cb){

  // TODO: convert phonenumber to MSISDN

  var postData = querystring.stringify({
    'Channel' : 'UK.VODAFONE',
    'SourceReference': refId,
    'MSISDN'  : phonenumber,
    'Content' : msg
  });

  var options = {
    hostname: 'localhost',
    port: 8080,
    path: '/users/sms',
    method: 'POST',
    auth: 'username:password',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var req = http.request(options, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
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

var obj={

  handleSMS: function(messageObj,cb){
    _.each(messageObj.messageStatus,function(ph){
      var phone = ph;
      postSMS(phone.phonenumber,phone.id,messageObj.message,function(err,data){
        var status="sent";
        if(err) status="fail";
        Message.changeSMSStatus(phone._id,status,function(e,m){
          if (e) console.log(e);
          // updated message.
        });
      });
    });
  }
};


module.exports=obj;
