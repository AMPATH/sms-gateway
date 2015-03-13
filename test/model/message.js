var app = require('../../app.js'),
    _ = require('underscore'),
    expect  = require('expect.js');

var mongoose = require('mongoose'),
    Message = mongoose.model('Message');


describe('Message Model', function(){

  beforeEach(function(){
    Message.collection.remove(function(err){
    });
  });


  describe('phonenumber',function(){

    var data = {
      "appName": "app2",
      "token": "random token123",
      "sender":{
        "name": "sender1",
        "id": "1"
      },
      "message": "this is sample message",
      "messageStatus":[
        {"phonenumber": "+9188556678"},
        {"phonenumber": "+9100056678"}
      ]
    };

    it('should be able to query and update with phonenumber',function(done){
      var msg = new Message(data);
      msg.save(function(err,m){
        expect(err).to.be(null);

        var phoneId = m.messageStatus[0]._id;

        Message.findOneAndUpdate({'messageStatus':{$elemMatch: {phonenumber: '+9188556678'}}},{
          "$set": {
            "messageStatus.$.status": 'sent'
          }
        },function(err,data){
          if (err) return done(err);

          expect( data.messageStatus[0].status).to.be("sent");
          expect( data.messageStatus[1].status).to.be("sending");
          done();
        });
      });

    });

    it('should change sms status',function(done){
      var msg = new Message(data);
      msg.save(function(err,m){
        expect(err).to.be(null);

        var phoneId = m.messageStatus[0].id;
        Message.changeSMSStatus(phoneId,'failed',function(e,m){
          expect(e).to.be(null);

          expect(m.messageStatus[0].status).to.be("failed");
          done();
        });
      });
    });
  });

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
