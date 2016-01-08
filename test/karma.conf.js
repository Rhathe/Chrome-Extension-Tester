// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-08-06 using
// generator-karma 0.8.3

module.exports = function(config) {
	'use strict';

	config.set({
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// base path, that will be used to resolve files and exclude
		basePath: '../',

		// testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: [
			'test/mocks/unit/**/*.js',
			'extension/js/jquery-1.11.2.min.js',
			'extension/js/storage.js',
			'extension/js/api.js',
			'extension/js/config.js',
			'extension/js/**/*.js',
			'test/unit/**/*.js'
		],

		// web server port
		port: 8080,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: [
			'PhantomJS'
		],

		// Which plugins to enable
		plugins: [
			'karma-phantomjs-launcher',
			'karma-jasmine'
		],

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true,

		colors: true,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO
	});
};
