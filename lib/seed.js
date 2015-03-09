var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    env = process.env.NODE_ENV || 'development';


var data = {
  development: {
    adminUser: {
      name: 'admin',
      password: '@dm1n'
    }
  },

  test: {
    adminUser: {
      name: 'admin',
      password: '@dm1n'
    }
  },

  production: {

  }
};

if (data[env].adminUser){
  User.count({},function(err,count){
    if(err) return;
    if(!count){
      user = new User(data[env].adminUser);
      user.save(function(err,usr){
      });
    }
  });
}
