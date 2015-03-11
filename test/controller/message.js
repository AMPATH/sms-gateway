var request = require('supertest'),
    expect  = require('expect.js'),
    express = require('express');

var app = require('../../app.js');

var mongoose = require('mongoose'),
    Application = mongoose.model('Application');
    User = mongoose.model('User');
    Message = mongoose.model('Message');

 var msg_data = {
       "appName": "app1",
       "token": "test token",
       "sender":{
         "name": "sender1",
         "id": "1"
       },
       "message": "this is sample message",
       "messageStatus":[
         {"phonenumber": "+9188556678"}
       ]
     };


describe('Message Controller', function(){

  before(function(done){
    application = new Application({name: "appForTest", secret: "Secret123", active: true, send: {limit: 2000, count: 0}});
    application.save(function(err){
      done();
    });
  });

  after(function(){
        Message.collection.remove(function(err){
        });
  });

  describe('POST message',function(){

    it('should fail without auth header',function(done){
      request(app)
          .post('/message')
          .expect(401,done);
    });


    it('should validate message data',function(done){
      request(app)
          .post('/message')
          .set("Authorization", "basic " + new Buffer("appForTest:Secret123").toString("base64"))
          .send({})
          .expect(400,done);
    });

    it('should be successful with valid data',function(done){

      var data = {"token" : "one time token to identify individual requests (preventing replaying of messages)",
          "sender": {
              "name": "Bob Smith",
              "id": "121313"
          },
          "recipients": ["055 0840 7317","0934 861 9007","(0151) 545 1812"],
          "message": "This is from new sms-gateway",
          "statusNotification": false/true
      };


      var output = {
          "message": 'This is from new sms-gateway',
          "sender": {
              "name": 'Bob Smith',
              "id": '121313'
          },
          "messageStatus": [{
              "phonenumber": '055 0840 7317',
              "status": 'sending'
          }, {
              "phonenumber": '0934 861 9007',
              "status": 'sending'
          }, {
              "phonenumber": '(0151) 545 1812',
              "status": 'sending'
          }]
      };


      request(app)
                .post('/message')
                .set("Authorization", "basic " + new Buffer("appForTest:Secret123").toString("base64"))
                .send(data)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    expect(res.body).to.have.property("id");
                    delete res.body.id;
                    expect(res.body).to.eql(output);
                    done();
                });
      });
  });

  describe('GET message details',function(){

      it('should fail without auth header',function(done){
        request(app)
            .get('/message/blahblah')
            .expect(401,done);
      });


      it('should return 404 if the message id is invalid',function(done){
             request(app)
               .get('/message/12345')
               .set("Authorization", "basic " + new Buffer("appForTest:Secret123").toString("base64"))
               .expect(404)
               .expect("Unable to find message with id '12345'",done);
      });

      it('should return message details for valid request',function(done){
            var msg = new Message(msg_data);
            msg.save(function(err){
               expect(err).to.be(null);
                       request(app)
                         .get('/message/' + msg._id)
                         .set("Authorization", "basic " + new Buffer("appForTest:Secret123").toString("base64"))
                         .expect(200)
                         .end(function(err, res){
                             if (err) return done(err);
                             expect(res.body.message).to.be("this is sample message");
                             expect(res.body.sender.name).to.be("sender1");
                             done();
                         });
            });
       });
    });
});
