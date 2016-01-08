exports.config = {
	directConnect: true,

	// Chrome is not allowed to create a SUID sandbox when running inside Docker
	capabilities: {
		browserName: 'chrome',
		chromeOptions: {
			args: [
				'no-sandbox',
				'--test-type',
				'--load-extension=' + __dirname + '/../testextension'
			],
			binary: '/usr/bin/google-chrome'
		}
	},

	framework: 'jasmine2',

	jasmineNodeOpts: {
		defaultTimeoutInterval: 60000,  // https://github.com/angular/protractor/blob/master/docs/timeouts.md#timeouts-from-jasmine
		showColors: true,
		print: function () {}
	},

	// Where to find the test specs
	suites: {
		integration: 'integration/**/*.js'
	},

	// Where the web server is serving
	baseUrl: 'http://localhost:12222',

	onPrepare: function () {
		var jasmineReporters = require('jasmine-reporters');
		jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
			consolidateAll: true,
			filePrefix: 'xmloutput',
			savePath: 'results'
		}));

		var SpecReporter = require('jasmine-spec-reporter');
		jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));

		// when a test fails, dump the browser's console.log to stdout for inspection
		jasmine.getEnv().addReporter(new function() {
			this.specDone = function(result) {
				if (result.failedExpectations.length > 0) {
					browser.manage().logs().get('browser').then(function(browserLogs) {
						browserLogs.forEach(function(log){
							var d = new Date(log.timestamp);
							var ds = d.toString();
							var ts = ds.substr(0, 24) + '.' + ('000' + d.getMilliseconds()).slice(-3) + ' ' + ds.substr(25);
							console.log('    %s %s %s', ts, log.level.name, log.message);
						});
					});
				}
			};
		});

		global.runFunctionInTestBrowser = function(func) {
			var stringifiedFunctionToRun = func.toString();
			return browser.executeScript('return ' + stringifiedFunctionToRun + '();');
		};

		global.waitForFunctionInTestBrowser = function(func, timeLimit, errorMsg) {
			timeLimit = timeLimit || 3000;
			return browser.wait(function() {
				return runFunctionInTestBrowser(func);
			}, timeLimit, errorMsg);
		};

		// necessary for testing non-angular sites (doesn't wait to find global angular object)
		browser.ignoreSynchronization = true;

		// Asynchronously call script, browser.wait will time out until
		// callback returns a true value
		global.waitForExtensionScript = function(script, callback, timeLimit) {
			timeLimit = timeLimit || 10000;
			var scriptStr = script.toString();
			scriptStr = 'var s = ' + scriptStr +
						'; var cb = arguments[arguments.length-1]; ' +
						's(cb);';

			return browser.wait(function() {
				return browser.executeAsyncScript(scriptStr).then(callback, function() {
					console.error('Function: ' + scriptStr + ' timed out at ' + timeLimit);
				});
			}, timeLimit);
		};

		global.getLastRequests = function() {
			delete require.cache[require.resolve(__dirname + '/stubs/requests.json')];
			return require(__dirname + '/stubs/requests.json');
		};

		global.getLastRequest = function(path) {
			var file = __dirname + '/stubs/requests/' + path + '/request.json';
			delete require.cache[require.resolve(file)];
			return require(file);
		};

		global.openPopup = function() {
			return waitForFunctionInTestBrowser(function() {
				var openStatus = document.getElementById('extension_open_status');
				return openStatus && openStatus.innerHTML === 'closed';
			}).then(function() {
				return browser
					.actions()
					.keyDown(protractor.Key.ALT)
					.sendKeys('b')
					.keyUp(protractor.Key.ALT)
					.perform();
			}).then(function() {
				return waitForFunctionInTestBrowser(function() {
					var openStatus = document.getElementById('extension_open_status');
					return openStatus && openStatus.innerHTML === 'open';
				});
			});
		};

		global.closePopup = function() {
			return runFunctionInTestBrowser(function() {
				return window.closePopup && window.closePopup();
			});
		};

		global.checkLogin = function(pageUrl, login) {
			return browser.get(pageUrl).then(function() {
				return waitForUrl(pageUrl);
			}).then(function() {
				return waitForFunctionInTestBrowser(function() {
					return window.getExtensionId && window.getExtensionId();
				});
			}).then(function(val) {
				return openPopup();
			}).then(function() {
				return waitForExtensionScript(function(cb) {
					window.getCss('.after_login', 'display', cb);
				}, function(val) {
					return val.value === 'none';
				});
			}).then(login)
			.then(function() {
				return waitForFunctionInTestBrowser(function() {
					var loggedIn = document.getElementById('extension_logged_status');
					return loggedIn && loggedIn.innerHTML === 'Logged In';
				}, null, 'Checking of "Logged In" div failed');
			}).then(function() {
				return openPopup();
			}).then(function() {
				return waitForExtensionScript(function(cb) {
					window.getCss('.after_login', 'display', cb);
				}, function(val) {
					return val.value === 'block';
				});
			});
		};

		global.checkLogout = function() {
			return openPopup().then(function() {
				return waitForExtensionScript(function(cb) {
					window.getCss('.after_login', 'display', cb);
				}, function(val) {
					return val.value === 'block';
				});
			}).then(function() {
				return runFunctionInTestBrowser(function() {
					window.click('.logout_button');
				});
			}).then(function() {
				return waitForFunctionInTestBrowser(function() {
					var loggedIn = document.getElementById('extension_logged_status')
					return loggedIn.innerHTML === 'Logged In';
				}, null, 'Checking of "Logged In" div failed');
			}).then(function() {
				return closePopup();
			}).then(function() {
				return openPopup();
			}).then(function() {
				return waitForExtensionScript(function(cb) {
					window.getCss('.after_login', 'display', cb);
				}, function(val) {
					return val.value === 'none';
				});
			});
		};

		global.waitForUrl = function(testUrl) {
			return browser.wait(function() {
				return browser.getCurrentUrl().then(function(url) {
					var testRegex = new RegExp(testUrl);
					return testRegex.test(url);
				});
			}, 1000);
		};

		// Set async timeouts to 3 seconds
		browser.driver.manage().timeouts().setScriptTimeout(3000);
	}
};
