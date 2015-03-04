var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
  name: {type: String, required: "name is required"},
  secret: {type: String, required: "secret is required"},
  active: Boolean,
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
