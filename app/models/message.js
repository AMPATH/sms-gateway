var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema;

/**
 * Defines the Message model
 */
var MessageSchema = new Schema({
  appName: {type: String, required: "application name is required"},
  token: {type: String, required: "token is required"},
  sender: {
    name: String,
    id:   String
  },
  message: String,
  messageStatus: [
    {phonenumber: String, status: { type: String, default: "sending" },reference: String}
  ],
  date: { type: Date, default: Date.now }
});


/**
 * Ignore sensitive or unwanted fields while sending to client as json
 */
MessageSchema.methods.toJSON = function() {
 var obj = _.omit(this.toObject(),"__v","date","token","appName");
 obj.id = obj._id;
 delete obj._id;
 obj.messageStatus= _.map(obj.messageStatus,function(m){
   delete m._id;
   delete m.reference;
   return m;
 });

 return obj;
};


/**
 * Changes the status of an sms using id for lookup.
 *
 * @param  {String} id        id of the message
 * @param  {String} newStatus changed status of sms
 * @param  {callback} cb        callback which has two parameters error & message
 * object. if the match is found, it will return message object otherwise an error is returned
 */
MessageSchema.statics.changeSMSStatus = function (id,newStatus,cb) {

  this.findOneAndUpdate({'messageStatus':{$elemMatch: {_id: id}}},{
    "$set": {
      "messageStatus.$.status": newStatus
    }
  },cb);

};


/**
 * Changes the status of an sms using an unique reference for lookup.
 *
 * @param  {String} ref       unique reference assigned by provider to track a message
 * @param  {String} newStatus changed status of sms
 * @param  {callback} cb      callback which has two parameters error & message
 * object. if the match is found, it will return message object otherwise an error is returned
 */
MessageSchema.statics.changeSMSStatusWithReference = function (ref,newStatus,cb) {

  this.findOneAndUpdate({'messageStatus':{$elemMatch: {reference: ref}}},{
    "$set": {
      "messageStatus.$.status": newStatus
    }
  },function(err, message) {
        if (err) {
          return cb(err);
        }
        if(message){
                return cb(null,message);
        }
        return cb(new Error("Cannot find reference"));
      });
};


MessageSchema.index({ appName: 1, token: -1 },{unique: true});

mongoose.model('Message', MessageSchema);
