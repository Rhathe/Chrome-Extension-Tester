'use strict';

describe('Loading Test Chrome Extension (integration)', function () {

	var url = 'https://localhost:12222';

	// Dummy variables so that functions can be passed to browser window
	var window;

	var login = function() {
		return browser.executeScript(function() {
			window.click('.login_button');
		});
	};

	afterEach(function() {
		closePopup();
	});

	it('should login', function() {
		checkLogin(url, login);
	});

	it('should make api call', function () {
		openPopup()
		.then(function() {
		}).then(function() {
			return waitForExtensionScript(function(cb) {
				window.setValue('.text_input', 'Testing', cb);
			}, function(ret) {
				return true;
			});
		}).then(function(ret) {
			return waitForExtensionScript(function(cb) {
				window.click('.api_button', cb);
			}, function(ret) {
				return true;
			});
		}).then(function(ret) {
			return waitForExtensionScript(function(cb) {
				window.getText('.api_result', cb);
			}, function(ret) {
				return ret.value;
			});
		}).then(function(val) {
			// link has been bammed -- assert that correct API request was made
			var apiPath = '/api/';
			var apiRequest = getLastRequest(apiPath);

			expect(apiRequest.path).toEqual(apiPath);
			expect(apiRequest.method).toEqual('POST');
			expect(apiRequest.post_body.text).toEqual('Testing');

			expect(val).toEqual('RESULT');
		});
	});

	it('should logout', function() {
		checkLogout();
	});
});
