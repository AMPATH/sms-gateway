var app = require('../../app.js'),
    expect  = require('expect.js');

    describe('MSISDN conversion', function(){


    it('should convert phone number to MSISDN format',function(done){
        var Msisdn = require('mobile-to-msisdn').Msisdn;
        var m = new Msisdn('(415) 555-1212', 'Kenya');

        m.msisdn(function (err, formatted) {
          if (err) {
            console.log(err);
            return;
          }
         expect(formatted).to.be("2544155551212");
         done();
         });
    });

    it('should flag an error for phone numbers in incorrect formats',function(done){
            var Msisdn = require('mobile-to-msisdn').Msisdn;
            var m = new Msisdn('(415) 555-121223232', 'Kenya');

            m.msisdn(function (err, formatted) {
              if (err) {
                console.log(err);
                expect(err).not.to.be(null);
                done();
                return;
              }
             });
    });
});