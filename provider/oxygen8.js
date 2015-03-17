var _ = require('underscore'),
    mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    querystring = require('querystring'),
    http = require('http'),
    Msisdn = require('mobile-to-msisdn').Msisdn,
    wait = require('wait.for');



function postSMS(phonenumbers,msg,cb){

  var postData = querystring.stringify({
    'Channel' : 'UK.VODAFONE',
    'MSISDN'  : phonenumbers.join(","),
    'Content' : msg,
    'Multitarget': 1
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

function parseResult(messageObj,result){

  var resultData = result.split('\n');

  if (resultData.length < 3 || resultData[0] !== '101'){
    updateMessageStatus(messageObj,'failed');
    return;
  }

  updateMessageStatus(messageObj,"sent",resultData[2].split(","));
}


function updateMessageStatus(messageObj,status,ref){

  _.each(messageObj.messageStatus,function(ph,index){
     ph.status=status;
     if(ref && ref.length !== 0 && ref.length > index){
       ph.reference=ref[index];
     }
  });

  messageObj.save(function(err,msg){
    if(err) console.log("Unable to save the message object!");
  });

}
var obj={

  handleSMS: function(messageObj,cb){

    var phoneNumbers =  messageObj.messageStatus;
    var formatted;
    var formattedNumbers = [];

    var setter = function(error, formattedVal) { formatted = formattedVal; };

    function convertPhoneNumberToMSISDN(phoneNumber, setter) {

            try {
                  var m = new Msisdn(phoneNumber, 'Kenya');
                  var result = wait.forMethod(m, "msisdn");
                }
                catch(err) {
                   console.log(err);
                }
    }

    for (i = 0; i < phoneNumbers.length; i++) {
        convertPhoneNumberToMSISDN(phoneNumbers[i].phonenumber, setter);
        formattedNumbers[i] = formatted;
    }

    postSMS(formattedNumbers,messageObj.message,function(err,data){
      if(err){
        updateMessageStatus(messageObj,'failed');
        return;
      }
      parseResult(messageObj,data);
    });
  }
};


module.exports=obj;
