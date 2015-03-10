var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema;


var MessageSchema = new Schema({
  appName: {type: String, required: "application name is required"},
  token: {type: String, required: "token is required"},
  sender: {
    name: String,
    id:   String
  },
  message: String,
  messageStatus: [
    {phonenumber: String, status: { type: String, default: "sending" }}
  ],
  date: { type: Date, default: Date.now }
});

MessageSchema.index({ appName: 1, token: -1 },{unique: true});

mongoose.model('Message', MessageSchema);
