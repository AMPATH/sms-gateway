var app = require('../../app.js'),
    expect  = require('expect.js');

    var mongoose = require('mongoose'),
    Application = mongoose.model('Application');

describe('Application Model', function(){

  after(function(){
    Application.collection.remove(function(err){
    });
  });


  it('should return JSON',function(done){
    application = new Application({name: "appName", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
    application.save(function(err,app){
      expect(err).to.be(null);
      expect(app.toJSON()).not.to.have.property("secret");
      expect(app.toJSON()).not.to.have.property("_id");
      expect(app.toJSON()).not.to.have.property("__v");
      done();
    });
  });

  describe('secret',function(){
    it('should match with valid secret',function(done){
      application = new Application({name: "NewName", secret: "Secret123", active: true, send: {limit: 2000, count: 0}});
      application.save(function(err,app){
        expect(err).to.be(null);
        app.compareSecret("Secret123",function(err,isMatch){
          expect(err).to.be(null);
          expect(isMatch).to.be(true);
          done();
        });
      });
    });

    it('should not match with invalid secret',function(done){
      application = new Application({name: "NewNamewithInvalid", secret: "Secret123", active: true, send: {limit: 2000, count: 0}});
      application.save(function(err,app){
        expect(err).to.be(null);
        app.compareSecret("Secret1",function(err,isMatch){
          expect(err).to.be(null);
          expect(isMatch).to.be(false);
          done();
        });
      });
    });
  });


});
