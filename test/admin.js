var request = require('supertest'),
    express = require('express');

var app = require('../app.js');

var mongoose = require('mongoose'),
    Application = mongoose.model('Application');
    
describe('admin api', function(){

  it('get applications',function(done){
    request(app)
        .get('/admin/application')
        .expect(200, done);
  });


  describe('create application',function(){
    afterEach(function(){
      Application.collection.remove(function(err){

      });
    });

    it('fail without name',function(done){
      request(app)
        .post('/admin/application')
        .send({"secret": "123"})
        .expect(500)
        .expect("name is required",done);
    });

    it('fail without secret',function(done){
      request(app)
        .post('/admin/application')
        .send({"name": "new name"})
        .expect(500)
        .expect("secret is required",done);
    });

    it('create with valid name and secret',function(done){
      request(app)
        .post('/admin/application')
        .send({"name": "new name","secret": "123"})
        .expect(201,done);
    });
  });
});
