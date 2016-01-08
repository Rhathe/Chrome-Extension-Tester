var Main = function(window, chrome, $) {
	"use strict";
	var self = this;

	self.config = {
		apiUrl: window.apiUrl,
		authUrl: window.authUrl,
		userObject: {}
	};

	self.storage = new Storage(chrome);
	self.api = new Api(self.config, self.storage, $);

	self.login = function(e) {
		var authUrl = self.config.authUrl;
		e.preventDefault();
		e.stopPropagation();

		chrome.runtime.getBackgroundPage(function(bp) {
			bp.background.login(authUrl, function(resp, url) {
				window.close();
			});
		});
	};

	self.logout = function(e) {
		e.preventDefault();
		e.stopPropagation();
		self.storage.clearLocalStorageKeys();
		window.close();
	};

	self.makeApiCall = function() {
		var data = {
			text: $('.text_input').val()
		};

		self.api.postTextToApi(data, function(resp) {
			self.api.response = resp;
			$('.api_result').text(resp.data);
		}, function(error) {
			self.api.error = error;
		});
	};

	self.afterLogin = function () {
		$('.before_login').hide();
		$('.after_login').show();
	};

	self.resumeStateFromLocalStorage = function(items) {
		if (items.accessToken) {
			var at = window.jwt_decode(items.accessToken);

			try {
				self.config.userObject = {
					email: at.email,
					token: items.accessToken
				};
				self.afterLogin();
			} catch (e) {
				self.storage.clearLocalStorageKeys();
			}
		}
	};

	self.run = function() {
		$(function() {
			self.storage.getLocalStorageKeys(null, self.resumeStateFromLocalStorage);
			$('.login_button').on('click', self.login);
			$('.logout_button').on('click', self.logout);
			$('.api_button').on('click', self.makeApiCall);
		});
	};
};

var main = new Main(window, chrome, $);
main.run();
