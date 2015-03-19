var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    _ = require('underscore'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;



/**
 * Defines User model
 */
var UserSchema = new Schema({
  name: {type: String, required: "name is required",  unique: true},
  password: {type: String, required: "secret is required"}
});


// Convert name to lowercase
UserSchema.pre('validate', function (next, data) {
  if (this.name) {
      this.name = this.name.toLowerCase();
  }
  next();
});


// Middleware for encrypting secret key
UserSchema.pre('save',function(next){
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10,function(err,salt){
    if (err) return next(err);
    bcrypt.hash(user.password,salt,function(err,hash){
      if(err) return next(err);
      user.password=hash;
      next();
    });

  });
});


UserSchema.plugin(uniqueValidator,{message: "User with name '{VALUE}' already exists."});

/**
 * Compares password
 */
UserSchema.methods.comparePassword = function(candidatePassword, cb) {

    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


/**
 * Checks if the user is authorized
 *
 * @param  {String} username description
 * @param  {String} password description
 * @param  {callback} cb callback which has two parameters  i.e error & user
 * object. if the match is found, it will return user object otherwise an error is returned.
 */
UserSchema.statics.authorize = function (username,password, cb) {

  this.findOne({name: username},function(err,user){

    if(err) {return cb(err);}

    if (user){
      user.comparePassword(password,function(err,isMatch){
        if(isMatch){
          return cb(null,user);
        }else{
          return cb(new Error("Invalid user"));
        }
      });
    }else{
      return cb(new Error("Invalid user"));
    }
  });
};

mongoose.model('User', UserSchema);
