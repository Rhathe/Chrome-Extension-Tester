(function (window, chrome) {
	"use strict";

	chrome.runtime.onMessageExternal.addListener(
		function(request, sender, sendResponse) {
			if (request.fn) {
				// Eval passed function, send result back to web page
				eval("window.fn = " + request.fn);
				var passWindow = request.window === 'popup' ? chrome.extension.getViews({type: 'popup'})[0] : window;
				sendResponse({value: passWindow && fn(passWindow, chrome, request, sender, sendResponse)});
			}
		}
	);

	// Check every half second to see if the popup is open or closed,
	// then send message to content script
	setInterval(function() {
		var win = chrome.extension.getViews({type: 'popup'})[0];
		var message = {popupState: win ? 'open' : 'closed'};
		chrome.tabs.getSelected(null, function(tab) {
			if (tab.id >= 0) chrome.tabs.sendMessage(tab.id, message, function() {});
		});
	}, 500);

}(window, chrome));
