'use strict';

describe('Api object', function () {

	var api, mockConfig, mockStorage, mock$;

	beforeEach(function() {
		mockConfig = {
			apiUrl: 'https://test.example/',
			userObject: {
				token: 'token',
			}
		};

		mockStorage = {
			clearLocalStorageKeys: function() {}
		};

		mock$ = {
			ajax: function() {}
		};

		spyOn(mock$, 'ajax');
		api = new Api(mockConfig, mockStorage, mock$);
	});

	it('should send api request', function () {
		var obj = {url: 'blah'};
		api.sendApiRequest(obj);
		expect(mock$.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
			headers : { Authorization : 'Bearer token' },
			url : 'https://test.example/blah',
			contentType : 'application/json; charset=utf-8',
			dataType : 'json'
		}));
	});
});
