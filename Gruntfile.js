'use strict';

var request = require('request');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729, files;

  grunt.initConfig({
    jshint: {
      all: ['app/**/*.js','config/express.js','test/**/*.js','provider/**/*.js']
    },
    env: {
      dev: {
        NODE_ENV : 'development'
      },
      test: {
        NODE_ENV : 'test'
      }
    },
    mochaTest: {
     test: {
       options: {
         reporter: 'spec',
         quiet: false, // Optionally suppress output to standard out (defaults to false)
         clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
       },
       src: ['test/**/*.js']
     }
    },
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      js: {
        files: [
          'app.js',
          'app/**/*.js',
          'config/*.js',
          'provider/*.js',
          'lib/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      css: {
        files: [
          'public/css/*.css'
        ],
        options: {
          livereload: reloadPort
        }
      },
      views: {
        files: [
          'app/views/*.ejs',
          'app/views/**/*.ejs'
        ],
        options: { livereload: reloadPort }
      }
    }
  });

  grunt.config.requires('watch.js.files');
  files = grunt.config('watch.js.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function(err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded)
            grunt.log.ok('Delayed live reload successful.');
          else
            grunt.log.error('Unable to make a delayed live reload.');
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('default', [
    'develop',
    'watch'
  ]);
  grunt.registerTask('test',['jshint','env:test','mochaTest']);
};
