var app = require('../../app.js'),
    expect  = require('expect.js');

var mongoose = require('mongoose'),
    User = mongoose.model('User');


describe('User Model', function(){

  after(function(){
    User.collection.remove(function(err){
    });
  });

  describe('save',function(){

    it('should not save without name',function(done){
      user = new User({password: "not so secret"});
      user.save(function(err,usr){
        expect(err).not.to.be(null);
        done();
      });
    });

    it('should not save without password',function(done){
      user = new User({name: 'admin1'});
      user.save(function(err,usr){
        expect(err).not.to.be(null);
        done();
      });
    });

    it('should save with valid name and password',function(done){
      user = new User({name: 'admin1',password: "not so secret"});
      user.save(function(err,usr){
        expect(err).to.be(null);
        expect(usr).to.be(user);
        done();
      });
    });


  });

});
