var Storage = function(chrome) {
	this.localStorageKeys = [
		'accessToken',
		'error',
		'errorDescription'
	];

	this.getLocalStorageKeys = function(keys, callback) {
		keys = keys || this.localStorageKeys;

		chrome.storage.local.get(keys, function (items) {
			callback(items);
		})
	};

	this.clearLocalStorageKeys = function() {
		chrome.storage.local.clear();
	};
};
