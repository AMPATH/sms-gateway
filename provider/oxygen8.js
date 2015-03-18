var _ = require('underscore'),
    mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    querystring = require('querystring'),
    validate = require("validate.js");
    http = require('http');


/**
 * numberingScheme for Kenya
 */
var numberingSchemeKenya={
    internationalCode: "254",
    nationalPrefix: "0",
    canStartWithInternationalCode: false,
    minLength: 10,
    maxLength: 10,
    formats: [
      "^(254)[0-9]{10}$"
    ]
};


function strip(unformattedInput) {
  return unformattedInput.replace(/[^0-9]/g, '');
}

/**
 * Returns a msisdn from the unformatted input string
 *
 * @param {String} unformatted
 * @param {Object} numberingScheme Containing {"internationalCode": {String}, "nationalPrefix": {String}, "canStartWithInternationalCode": {Boolean} }
 * @returns {String}
 */
function msisdnFromUnformatted(unformatted, numberingScheme) {

  // strip out non-digits
  var stripped,
    withoutNationalDialingPrefix;

  stripped = strip(unformatted);

  // strip the national dialing prefix, if it exists, since it's not part of a msisdn
  withoutNationalDialingPrefix = stripped;
  if (numberingScheme.nationalPrefix) {
    if (0 === stripped.indexOf(numberingScheme.nationalPrefix)) {
      withoutNationalDialingPrefix = stripped.substring(numberingScheme.nationalPrefix.length);
    }
  }

  // prepend the international prefix, if not already there
  if (0 === withoutNationalDialingPrefix.indexOf(numberingScheme.internationalCode)) {
    // international code must already be there, since local format does not permit number to begin with it
    if (!numberingScheme.canStartWithInternationalCode) {
      return withoutNationalDialingPrefix;
    }

    // fall-through: indicates international code probably not present since local format permits numbers to begin with it
  }

  return numberingScheme.internationalCode + withoutNationalDialingPrefix;
}

function postSMS(phonenumbers,msg,cb){

  var postData = querystring.stringify({
    'Channel' : 'UK.VODAFONE',
    'MSISDN'  : phonenumbers.join(","),
    'Content' : msg,
    'Receipt' : 1,
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

function parseResult(messageObj,result,cb){

  var resultData = result.split('\n');

  if (resultData.length < 3 || resultData[0] !== '101'){
    updateMessageStatus(messageObj,'failed',null,cb);
    return;
  }

  updateMessageStatus(messageObj,"sent",resultData[2].split(","),cb);
}


function updateMessageStatus(messageObj,status,ref,cb){

  _.each(messageObj.messageStatus,function(ph,index){
     ph.status=status;
     if(ref && ref.length !== 0 && ref.length > index){
       ph.reference=ref[index];
     }
  });

  messageObj.save(function(err,msg){
    if(err) console.log("Unable to save the message object!");
  });

  cb(status);
}

var obj={
  handleSMS: function(messageObj,cb){
    var formattedPhonenumbers =  _.map(messageObj.messageStatus,function(ph){
      return msisdnFromUnformatted(ph.phonenumber,numberingSchemeKenya);
    });

    postSMS(formattedPhonenumbers,messageObj.message,function(err,data){
      if(err){
        updateMessageStatus(messageObj,'failed',null,cb);
        return;
      }
      parseResult(messageObj,data,cb);
    });
  },

  isSupportCallback: function(){
    return true;
  },

  processCallback: function(req, res, next){

    var validation={
        "Reference": {presence: true},
        "Status": { presence: true}
      };

    var err = validate(req.body,validation);

    if(err){
        return res.status(400).send(err);
    }

    var reference = req.body.Reference;
    var status = req.body.Status;

    Message.changeSMSStatusWithReference(reference,status,function(err,message){
        if(err) return res.status(400).send("Fail");
        if(message) return res.status(200).send("Success");
    });
  }
};

module.exports=obj;
