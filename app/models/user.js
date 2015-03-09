var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    _ = require('underscore'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;



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

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

mongoose.model('User', UserSchema);
