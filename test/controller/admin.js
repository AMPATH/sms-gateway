var request = require('supertest'),
    expect  = require('expect.js'),
    express = require('express');

var app = require('../../app.js');

var mongoose = require('mongoose'),
    Application = mongoose.model('Application');



describe('Admin Controller', function(){

  before(function(){
    Application.collection.remove(function(err){
    });
  });

  it('Get applications',function(done){

    application = new Application({name: "App Name", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
    application.save(function(err){
      expect(err).to.be(null);
      request(app)
          .get('/admin/application')
          .expect(200)
          .end(function(err, res){
              if (err) return done(err);
              expect(res.body).to.have.length(1);
              expect(res.body[0].name).to.be("app name");
              done();
          });
    });

  });


  describe('get application details',function(){
    it('should return 404 for the application is invalid',function(done){
      request(app)
        .get('/admin/application/not_there')
        .expect(404)
        .expect("Unable to find application with name 'not_there'",done);
    });

    it('should return message details for valid request',function(done){
      application = new Application({name: "app1", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
      application.save(function(err){
        expect(err).to.be(null);
        request(app)
          .get('/admin/application/app1')
          .expect(200)
          .end(function(err, res){
              if (err) return done(err);
              expect(res.body.name).to.be("app1");
              done();
          });
      });
    });
  });


  describe('create application',function(){
    after(function(){
      Application.collection.remove(function(err){
      });
    });

    it('fail without name',function(done){
      request(app)
        .post('/admin/application')
        .send({"secret": "123"})
        .expect(400)
        .expect("name is required",done);
    });

    it('fail without secret',function(done){
      request(app)
        .post('/admin/application')
        .send({"name": "new name"})
        .expect(400)
        .expect("secret is required",done);
    });

    it('create with valid name and secret',function(done){
      var expectedJson={
        "name": "new name",
        "active": true,
        "send": {
           "limit": 200000,
           "count": 0
        }
      };
      request(app)
        .post('/admin/application')
        .send({"name": "new name","secret": "123"})
        .expect(201)
        .expect(JSON.stringify(expectedJson),done);
    });

    it('validate that the name of the application is unique', function(done){
      application = new Application({name: "Unique Name", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
      application.save(function(err){
        expect(err).to.be(null);
        request(app)
          .post('/admin/application')
          .send({"name": "Unique name","secret": "Secret"})
          .expect(400)
          .expect("Application with name 'unique name' already exists.",done);
      });
    });

    it('disable an enabled application', function(done){
          var expectedJson={
                  "name": "enabled_application",
                  "active": false,
                  "send": {
                     "limit": 2000,
                     "count": 0
                  }
                };
          application = new Application({name: "enabled_application", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
          application.save(function(err){
            expect(err).to.be(null);
            request(app)
              .post('/admin/application/enabled_application/disable')
              .send({"name": "enabled_application","secret": "Secret"})
              .expect(200)
              .expect(JSON.stringify(expectedJson),done);
          });
    });

     it('fail disabling a disabled application', function(done){

               application = new Application({name: "disabled_application", secret: "Secret", active: false, send: {limit: 2000, count: 0}});
               application.save(function(err){
                 expect(err).to.be(null);
                 request(app)
                   .post('/admin/application/disabled_application/disable')
                   .send({"name": "disabled_application","secret": "Secret"})
                   .expect(404)
                   .expect("Unable to find and disable application 'disabled_application'",done);
               });
             });
     });

     it('enable a disabled application', function(done){
               var expectedJson={
                       "name": "new_disabled_application",
                       "active": true,
                       "send": {
                          "limit": 2000,
                          "count": 0
                       }
                     };
               application = new Application({name: "new_disabled_application", secret: "Secret", active: false, send: {limit: 2000, count: 0}});
               application.save(function(err){
                 expect(err).to.be(null);
                 request(app)
                   .post('/admin/application/new_disabled_application/enable')
                   .send({"name": "new_disabled_application","secret": "Secret"})
                   .expect(200)
                   .expect(JSON.stringify(expectedJson),done);
               });
     });

     it('fail enabling a enabled application', function(done){

                    application = new Application({name: "new_enabled_application", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
                    application.save(function(err){
                      expect(err).to.be(null);
                      request(app)
                        .post('/admin/application/new_enabled_application/enable')
                        .send({"name": "new_enabled_application","secret": "Secret"})
                        .expect(404)
                        .expect("Unable to find and enable application 'new_enabled_application'",done);
                    });
     });

     it('change the sms limit of an application', function(done){
                var expectedJson={
                            "name": "new_application_for_limit_test",
                            "active": true,
                            "send": {
                               "limit": 5000,
                               "count": 0
                            }
                          };
                    application = new Application({name: "new_application_for_limit_test", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
                    application.save(function(err){
                      expect(err).to.be(null);
                      request(app)
                        .post('/admin/application/new_application_for_limit_test/limit')
                        .send({"name": "new_application_for_limit_test","secret": "Secret","limit": 5000 })
                        .expect(200)
                        .expect(JSON.stringify(expectedJson),done);
                 });

     });

     it('attempt to change sms limit with a float should return error message', function(done){
                         application = new Application({name: "new_application_for_float_limit_test", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
                         application.save(function(err){
                           expect(err).to.be(null);
                           request(app)
                             .post('/admin/application/new_application_for_NaN_limit_test/limit')
                             .send({"name": "new_application_for_NaN_limit_test","secret": "Secret","limit": 5000.89 })
                             .expect(404)
                             .expect("Limit should be a number",done);
                      });

          });

     it('attempt to change sms limit with a NaN should return error message', function(done){
                              application = new Application({name: "new_application_for_NaN_limit_test", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
                              application.save(function(err){
                                expect(err).to.be(null);
                                request(app)
                                  .post('/admin/application/new_application_for_NaN_limit_test/limit')
                                  .send({"name": "new_application_for_NaN_limit_test","secret": "Secret","limit": "sdjcaiuhfewh" })
                                  .expect(404)
                                  .expect("Limit should be a number",done);
                           });

               });


});
