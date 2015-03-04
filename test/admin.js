var request = require('supertest')
  , express = require('express');

var app = require('../app.js');

describe('admin api', function(){

  it('get applications',function(done){
    request(app)
        .get('/admin/application')
        .expect(200, done);
  });
});
