(function() {

// Defined here so that creating these functions here don't lead to errors
var passedWindow, passedChrome, request, sender, sendResponse;

// The content script has embedded the extension id into the div, get this value
window.getExtensionId = function() {
	window.extensionId = document.getElementById('extension_id').innerHTML;
	return window.extensionId.length && window.extensionId;
};

// Send message to testing_background.js of extension
window.sendExtensionMessage = function(args, msg, respFn) {
	var argArr = Array.prototype.slice.call(args, 0);

	if (!respFn) {
		// By default recall function to work around timing issues with extension
		respFn = function(response) {
			if (!response.value) {
				setTimeout(function() {
					args.callee.apply(null, argArr);
				}, 100);
			}
		};
	};

	if (msg.fn) {
		// This variables will be passed to the function in testing_background.js
		var fn = 'function(passedWindow, passedChrome, request, sender, sendResponse) { ';
		if (msg.variables) {
			var keys = Object.keys(msg.variables);
			for(var i = 0; i < keys.length; i++) {
				// Enable the closure variables here by evaling them here
				var set = 'var ' + keys[i] + ' = ' + JSON.stringify(msg.variables[keys[i]]) + '; ';
				eval(set);
				fn += set;
			}
		}

		fn += 'var f = ' + msg.fn.toString() + '; return f(); }';
		msg.fn = fn;
	}

	chrome.runtime.sendMessage(window.extensionId, msg, respFn);
};

// Log in using the access token in the hash of the main tab url
window.login = function(apiProtocol, apiDomain) {
	window.sendExtensionMessage(
		arguments,
		{
			fn: function() {
				return passedWindow.setStorage(sender.url, /\/[#\?](.*)/, apiProtocol, apiDomain);
			},
			variables: {
				apiProtocol: apiProtocol,
				apiDomain: apiDomain
			}
		},
		function(response) {}
	);
};

// Click element in extension popup
window.click = function(selector, callback) {
	window.sendExtensionMessage(
		arguments,
		{
			fn: function() {
				var el = $(passedWindow.document).find(selector);
				el.click();
				return el.length;
			},
			variables: {selector: selector},
			window: 'popup'
		},
		function(response) {
			if (callback) callback(response);
		}
	);
};

// Parse the dom of the popup window for the element by the selector
// and get it's info by the jQuery function: elFn and the arguments: elFnArgs
// then pass the response to the passed callback
window.elementInfo = function(selector, elFn, elFnArgs, callback, responseFn) {
	elFnArgs = elFnArgs || [];

	window.sendExtensionMessage(
		arguments,
		{
			fn: function() {
				var el = $(passedWindow.document).find(selector);
				return el && el[elFn].apply(el, elFnArgs);
			},
			variables: {selector: selector, elFn: elFn, elFnArgs: elFnArgs},
			window: 'popup'
		},
		function(response) {
			if (callback) callback(response);
		}
	);
};

// Get html of element in extension popup
window.getHtml = function(selector, callback) {
	return window.elementInfo(selector, 'html', null, callback);
};

// Get value of element in extension popup
window.getValue = function(selector, callback) {
	return window.elementInfo(selector, 'val', null, callback);
};

// Set value of element in extension popup
window.setValue = function(selector, value, callback) {
	return window.elementInfo(selector, 'val', [value], callback);
};

// Get text of element in extension popup
window.getText = function(selector, callback) {
	return window.elementInfo(selector, 'text', null, callback);
};

// Set text of element in extension popup
window.setText = function(selector, value, callback) {
	return window.elementInfo(selector, 'text', [value], callback);
};

// Get value of element in extension popup
window.getCss = function(selector, css, callback) {
	return window.elementInfo(selector, 'css', [css], callback);
};

window.setEnv = function(env) {
	window.sendExtensionMessage(
		arguments,
		{
			fn: function() {
				return passedWindow.main.setEnv(env);
			},
			variables: {env: env},
			window: 'popup'
		}
	);
	return true;
};

window.closePopup = function() {
	window.sendExtensionMessage(
		arguments,
		{
			fn: function() {
				return passedWindow.close();
			},
			window: 'popup'
		},
		function(response) {}
	);
};

})();
