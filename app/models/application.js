var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    _ = require('underscore'),
    bcrypt = require('bcrypt'),
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

ApplicationSchema.pre('save',function(next){
  var app = this;
  if (!app.isModified('secret')) return next();
  bcrypt.genSalt(10,function(err,salt){
    if (err) return next(err);
    bcrypt.hash(app.secret,salt,function(err,hash){
      if(err) return next(err);
      app.secret=hash;
      next();
    });

  });
});

ApplicationSchema.methods.compareSecret = function(candidateSecret, cb) {
    bcrypt.compare(candidateSecret, this.secret, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

mongoose.model('Application', ApplicationSchema);
