var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'sms-gateway'
    },
    port: 3000,
    db: 'mongodb://localhost/sms-gateway-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'sms-gateway'
    },
    port: 3000,
    db: 'mongodb://localhost/sms-gateway-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'sms-gateway'
    },
    port: 3000,
    db: 'mongodb://localhost/sms-gateway-production'
  }
};

module.exports = config[env];
