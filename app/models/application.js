
/**
 * Defines application model
 */
var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    _ = require('underscore'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;


/**
 * Application schema for application collection
 * in mongodb
 */
var ApplicationSchema = new Schema({
  name: {type: String, required: "name is required",  unique: true},
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


/**
 * Ignore sensitive or unwanted fields while sending to client as json.
 */
ApplicationSchema.methods.toJSON = function() {
  var obj = this.toObject();
  return _.omit(obj,"_id","__v","secret");
};


/**
 * validate hook using to convert application name to lowercase
 *
 */
ApplicationSchema.pre('validate', function (next, data) {
  if (this.name) {
      this.name = this.name.toLowerCase();
  }
  next();
});


/**
 * Pre-save hook: using to convert application secret to encrypted one.
 */
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


/**
 * Plugin for checking application name is unique.
 */
ApplicationSchema.plugin(uniqueValidator,{message: "Application with name '{VALUE}' already exists."});


/**
 * compareSecret: To match a plain text secret with encrypted secret.
 *
 * @param  {string} candidateSecret the plain text secret which should match app secret.
 * @param  {callback} cb  callback for getting if the secret is matching or not.
 * this callback has two paramater error, and isMatch
 */
ApplicationSchema.methods.compareSecret = function(candidateSecret, cb) {
    bcrypt.compare(candidateSecret, this.secret, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};



/**
 * authenticate : check the provided appname and secret is matching
 * with existing records or not
 *
 * @param  {string} appName application name
 * @param  {string} secret  application secret
 * @param  {callback} cb      callback which has two paramters erro & application
 * object. if the match is found , it will return application object otherwise an error is returned
 */
ApplicationSchema.statics.authenticate = function (appName,secret, cb) {

  if(!appName) return cb(new Error("Invalid application"));


  this.findOne({name: appName.toLowerCase()},function(err,app){
    if(err) return cb(err);

    if(app){
      app.compareSecret(secret,function(err,isMatch){
        if(isMatch){
          return cb(null,app);
        }else{
          cb(new Error("Invalid application"));
        }
      });
    }else{
      cb(new Error("Invalid application"));
    }
  });
};

mongoose.model('Application', ApplicationSchema);
