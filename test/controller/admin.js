var request = require('supertest'),
    expect  = require('expect.js'),
    express = require('express');

var app = require('../../app.js');

var mongoose = require('mongoose'),
    Application = mongoose.model('Application');
    User = mongoose.model('User');


describe('Admin Controller', function(){

  describe('Without Basic Auth ',function(){

    it('should fail get application',function(done){
      request(app)
          .get('/admin/application')
          .expect(401,done);
    });

    it('should fail post application',function(done){
      request(app)
          .post('/admin/application')
          .expect(401,done);
    });

    it('should fail get application details',function(done){
      request(app)
          .get('/admin/application/app1')
          .expect(401,done);
    });

    it('should fail enable application',function(done){
      request(app)
          .post('/admin/application/app1/enable')
          .expect(401,done);
    });

    it('should fail disable application',function(done){
      request(app)
          .post('/admin/application/app1/disable')
          .expect(401,done);
    });

    it('should fail change limit application',function(done){
      request(app)
          .post('/admin/application/app1/limit')
          .expect(401,done);
    });
  });

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
              .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
        .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
        .expect(404)
        .expect("Unable to find application with name 'not_there'",done);
    });

    it('should return message details for valid request',function(done){
      application = new Application({name: "app1", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
      application.save(function(err){
        expect(err).to.be(null);
        request(app)
          .get('/admin/application/app1')
          .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
          .expect(200)
          .end(function(err, res){
              if (err) return done(err);
              expect(res.body.name).to.be("app1");
              done();
          });
      });
    });

    it('should handle application names with spaces',function(done){
      application = new Application({name: "app1 withspace", secret: "Secret", active: true, send: {limit: 2000, count: 0}});
      application.save(function(err){
        expect(err).to.be(null);
        request(app)
          .get('/admin/application/app1 withspace')
          .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
          .expect(200)
          .end(function(err, res){
              if (err) return done(err);
              expect(res.body.name).to.be("app1 withspace");
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
        .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
        .send({"secret": "123"})
        .expect(400)
        .expect("{\"name\":[\"Name can\'t be blank\"]}",done);
    });

    it('fail if name contains symbols other than -_',function(done){
          request(app)
            .post('/admin/application')
            .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
            .send({"name": "new~!@#$%^&*name"})
            .send({"secret": "123"})
            .expect(400)
            .expect("{\"name\":[\"Name can contain alphanumeric - and _ symbols only\"]}",done);
    });

    it('fail without secret',function(done){
      request(app)
        .post('/admin/application')
        .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
        .send({"name": "new name"})
        .expect(400)
        .expect("secret is required",done);
    });

    it('create with valid alphanumeric name containing - and _',function(done){
          var expectedJson={
            "name": "new-app_123",
            "active": true,
            "send": {
               "limit": 200000,
               "count": 0
            }
    };
    request(app)
            .post('/admin/application')
            .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
            .send({"name": "new-app_123","secret": "123"})
            .expect(201)
            .expect(JSON.stringify(expectedJson),done);
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
        .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
          .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
              .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
                   .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
                   .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))

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
                        .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
                        .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
                             .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
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
                                  .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
                                  .send({"name": "new_application_for_NaN_limit_test","secret": "Secret","limit": "sdjcaiuhfewh" })
                                  .expect(404)
                                  .expect("Limit should be a number",done);
                           });

               });

    describe('change password for admin user',function(){

        after(function(){
              User.collection.remove(function(err){
                var user = new User({name: 'admin', password: '@dm1n'});
                user.save(function(err){
                 });
               });
        });

        it('should change password',function(done){
          request(app)
            .post('/admin/password')
            .set("Authorization", "basic " + new Buffer("admin:@dm1n").toString("base64"))
            .send({"new_password": "changed_password" })
            .expect(200)
            .expect("Password changed successfully for user 'admin'", done);
        });

        it('should reject requests with empty password',function(done){
                  request(app)
                    .post('/admin/password')
                    .set("Authorization", "basic " + new Buffer("admin:changed_password").toString("base64"))
                    .send({"new_password": "" })
                    .expect(400)
                    .expect("Password can\'t be blank", done);
        });
    });
});
