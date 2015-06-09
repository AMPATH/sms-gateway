var request = require('supertest'),
    expect  = require('expect.js'),
    express = require('express');

var app = require('../../app.js');

var mongoose = require('mongoose'),
    Application = mongoose.model('Application');
    User = mongoose.model('User');


describe('Receipt Controller', function(){

    beforeEach(function(done){
        application = new Application({name: "appForTest", secret: "Secret123", active: true, send: {limit: 2000, count: 0}});
        application.save(function(err){
          done();
        });
      });

      afterEach(function(done){
        Application.collection.remove(function(err){
          done();
        });

        Message.collection.remove(function(err){
        });
      });

    var data = {
      "appName": "appForTest",
      "token": "random token123",
      "sender":{
        "name": "sender1",
        "id": "1"
      },
      "message": "this is sample message",
      "messageStatus":[
        {"phonenumber": "+9188556678", "reference": "abc123"},
        {"phonenumber": "+9100056678", "reference": "def456"},
        {"phonenumber": "+9100056679", "reference": "hij789"}
      ]
    };

    var statusUpdateData = {
        "Reference" : "hij789",
        "Status" : "Delivered",
    };

    var missingStatusUpdateData = {
        "Reference" : "hij789",
        "Status" : "",
    };

    var missingReferenceUpdateData = {
            "Reference" : "",
            "Status" : "Delivered",
        };

    var invalidReferenceStatusUpdateData = {
        "Reference" : "blah",
        "Status" : "Delivered",
    };

    it('update the message status when a delivery update is received with a valid reference',function(done){
         var msg = new Message(data);
         msg.save(function(err,m){
            expect(err).to.be(null);

            request(app)
            .post('/receipt')
            .send(statusUpdateData)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                expect("Success",done());
            });
         });
    });

    it('should not update the message status when an invalid delivery update is received with a valid reference',function(done){
             var msg = new Message(data);
             msg.save(function(err,m){
                expect(err).to.be(null);

                request(app)
                .post('/receipt')
                .send(missingStatusUpdateData)
                .expect(400)
                .end(function(err, res){
                    if (err) return done(err);
                    expect("Fail",done());
                });
             });
    });

    it('should not update the message status when an in valid delivery update is received with missing reference',function(done){
                 var msg = new Message(data);
                 msg.save(function(err,m){
                    expect(err).to.be(null);

                    request(app)
                    .post('/receipt')
                    .send(missingReferenceUpdateData)
                    .expect(400)
                    .end(function(err, res){
                        if (err) return done(err);
                        expect("Fail",done());
                    });
                 });
        });
});
