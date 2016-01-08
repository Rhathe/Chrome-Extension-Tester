var Api = function(config, storage, $) {

	this.sendApiRequest = function (obj) {
		var passedError = obj.error;
		obj.headers = {'Authorization': 'Bearer ' + config.userObject.token};
		obj.url = config.apiUrl + obj.url;
		obj.contentType = 'application/json; charset=utf-8';
		obj.dataType = 'json';
		obj.crossDomain = true;

		obj.error = function (resp) {
			var msg;
			var data = null;

			try {
				if (resp.status === 401) {
					storage.clearLocalStorageKeys();
					msg = 'Close extension and relogin';
				} else {
					msg = resp.responseJSON.error.message;
					data = resp.responseJSON.error.data;
				}
			} catch (e) {
				msg = 'Connection error, please try again';
			}

			if (passedError) passedError(resp.status, msg, data);
		};

		return $.ajax(obj);
	};

	this.postTextToApi = function(data, callback, errorCallback) {
		return this.sendApiRequest({
			url: '',
			method: 'post',
			data: JSON.stringify(data),
			success: callback,
			error: errorCallback
		});
	};
};
