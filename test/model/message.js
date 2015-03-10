var app = require('../../app.js'),
    _ = require('underscore'),
    expect  = require('expect.js');

var mongoose = require('mongoose'),
    Message = mongoose.model('Message');


describe('Message Model', function(){

  describe('save',function(){
    var data = {
      "appName": "app1",
      "token": "random token",
      "sender":{
        "name": "sender1",
        "id": "1"
      },
      "message": "this is sample message",
      "messageStatus":[
        {"phonenumber": "+9188556678"}
      ]
    };

    beforeEach(function(){
      Message.collection.remove(function(err){
      });
    });

    it('should fail without appname',function(done){
      var msgWithoutName = _.omit(data,'appName');
      var msg = new Message(msgWithoutName);
      msg.save(function(err,m){
        expect(err).not.to.be(null);
        expect(err.errors).to.have.property('appName');
        done();
      });
    });

    it('should fail without token',function(done){
      var msgWithoutName = _.omit(data,'token');
      var msg = new Message(msgWithoutName);
      msg.save(function(err,m){
        expect(err).not.to.be(null);
        expect(err.errors).to.have.property('token');
        done();
      });
    });

    it('should not allow duplicate token',function(done){
      var msg = new Message(data);
      msg.save(function(err,m){
        expect(err).to.be(null);
        var newmsg = new Message(data);
        newmsg.save(function(err,nm){
          expect(err).not.to.be(null);
          done();
        });
      });
    });

    it('should allow same token in different app',function(done){
      var msg = new Message(data);
      msg.save(function(err,m){
        expect(err).to.be(null);
        var newdata = _.clone(data);
        newdata.appName ="app2";
        var newmsg = new Message(newdata);
        newmsg.save(function(err,nm){
          expect(err).to.be(null);
          done();
        });
      });

    });

  });

});
