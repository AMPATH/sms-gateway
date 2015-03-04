var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
  name: String,
  secret: String,
  active: Boolean,
  url: String,
  send:{
    limit: Number,
    count: Number
  }
});

ApplicationSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

mongoose.model('Application', ApplicationSchema);
