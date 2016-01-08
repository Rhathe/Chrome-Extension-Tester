var Background = function(window, chrome) {
	'use strict';

	var self = this;
	var redirectUri = chrome.identity.getRedirectURL();
	var redirectRe = new RegExp(redirectUri + '[#\?](.*)');

	self.parseRedirectFragment = function (fragment) {
		var pairs = fragment.split(/&/);
		var values = {};

		pairs.forEach(function (pair) {
			var nameval = pair.split(/=/);
			values[nameval[0]] = nameval[1];
		});

		return values;
	};

	self.setStorage = function(responseUrl, redirectRe) {
		var storageObj;
		var matches = responseUrl.match(redirectRe);

		if (matches && matches.length > 1) {
			var params = self.parseRedirectFragment(matches[1]);
			storageObj = {
				'accessToken': params.access_token && decodeURIComponent(params.access_token),
				'error': params.error && decodeURIComponent(params.error),
				'errorDescription': params.error_description && decodeURIComponent(params.error_description),
			};
			chrome.storage.local.set(storageObj);
		}
		return storageObj;
	};

	// Loaded and called in main.js
	self.login = function (authUrl, cb, errCb) {
		chrome.storage.local.clear();

		// Client_id in backend config
		var url = authUrl
			+ '?state=' + Math.random().toString(36)
			+ '&client_id=clientId'
			+ '&redirect_uri='
			+ encodeURIComponent(redirectUri)
			+ '&response_type=token';

		chrome.identity.launchWebAuthFlow({
			'url': url,
			'interactive': true
		}, function (responseUrl) {
			if (chrome.runtime.lastError) {
				if (errCb) errCb(chrome.runtime.lastError.message);
			} else {
				self.setStorage(responseUrl, redirectRe);
				if (cb) cb(responseUrl, url);
			}
		});
	};
};

var background = new Background(window, chrome);
