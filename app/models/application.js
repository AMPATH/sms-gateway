var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    _ = require('underscore'),
    Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
  name: {type: String, required: "name is required",  unique: true},
  secret: {type: String, required: "secret is required"},
  active: Boolean,
  send:{
    limit: Number,
    count: Number
  }
});

ApplicationSchema.plugin(uniqueValidator,{message: "Application with name '{VALUE}' already exists."});

ApplicationSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

ApplicationSchema.methods.toJSON = function() {
  var obj = this.toObject();
  return _.omit(obj,"_id","__v","secret");
};

mongoose.model('Application', ApplicationSchema);
