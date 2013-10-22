module.exports = function (grunt) {
  'use strict';

  var path = require('path');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
            ' * <%= pkg.title %> v<%= pkg.version %>\n' +
            ' *\n' +
            ' * <%= pkg.description %>\n' +
            ' *\n' +
            ' * <%= pkg.homepage %>\n' +
            ' *\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> by <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n',
    concat: {
      options: {
        banner: '<%= banner %>'
      },
      plugin: {
        src: 'src/plugin.js',
        dest: 'build/plugin.js'
      },
      tinyvision: {
        src: [
          'lib/jquery/jquery.js',
          'lib/jquery-placeholder/jquery.placeholder.js',
          'lib/jquery.scrollTo/jquery.scrollTo.js',
          'lib/jquery-throttle-debounce/jquery.ba-throttle-debounce.js',
          'lib/unveil/jquery.unveil.js',
          'lib/handlebars.js/dist/handlebars.runtime.js',
          'build/js/handlebars.templates.js',
          'src/<%= pkg.name %>.js'
        ],
        dest: 'build/js/<%= pkg.name %>.js'
      }
    },
    copy: {
      build: {
        expand: true,
        cwd: 'src/',
        src: [
          'fonts/*',
          '<%= pkg.name %>.html'
        ],
        dest: 'build/'
      }
    },
    handlebars: {
      build: {
        options: {
          namespace: 'Handlebars.templates',
          processName: function (filePath) {
            return path.basename(filePath, '.hbs');
          }
        },
        src: 'src/templates/*.hbs',
        dest: 'build/js/handlebars.templates.js'
      }
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: 'Gruntfile.js'
        }
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        files: {
          src: 'src/**/*.js'
        }
      }
    },
    sass: {
      build: {
        options: {
          style: 'expanded'
        },
        src: 'src/scss/tinyvision.scss',
        dest: 'build/tinyvision.css'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      plugin: {
        src: 'build/plugin.js',
        dest: 'build/plugin.min.js'
      },
      tinyvision: {
        src: 'build/js/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      concatPlugin: {
        files: '<%= concat.plugin.src %>',
        tasks: 'concat:plugin'
      },
      concatTinyVision: {
        files: '<%= concat.tinyvision.src %>',
        tasks: 'concat:tinyvision'
      },
      copy: {
        files: '<%= copy.build.src %>',
        tasks: 'copy'
      },
      handlebars: {
        files: '<%= handlebars.build.src %>',
        tasks: 'handlebars'
      },
      jshintGruntfile: {
        files: '<%= jshint.gruntfile.files.src %>',
        tasks: 'jshint:gruntfile'
      },
      jshintSrc: {
        files: '<%= jshint.src.files.src %>',
        tasks: 'jshint:src'
      },
      sass: {
        files: 'src/scss/*.scss',
        tasks: 'sass'
      },
      uglifyPlugin: {
        files: '<%= uglify.plugin.src %>',
        tasks: 'uglify:plugin'
      },
      uglifyTinyVision: {
        files: '<%= uglify.tinyvision.src %>',
        tasks: 'uglify:tinyvision'
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'copy', 'sass', 'handlebars', 'concat', 'uglify']);

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
