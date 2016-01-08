(function() {

	var getOrSetElement = function(id, innerHTML) {
		var holder = document.getElementById(id);
		if (!holder) {
			holder = document.createElement('DIV');
			holder.setAttribute('id', id);
			holder.innerHTML = innerHTML;
			document.body.insertBefore(holder, document.body.firstChild);
		}
		return holder;
	};

	// Only way to pass in extension id, since it's dynamic and you can't set it locally
	var holder = getOrSetElement('extension_id', chrome.runtime.id);

	// Inject extension helper script to dive web view ability to message extension
	var b = document.createElement('script');
	b.type = 'text/javascript';
	b.src = 'https://localhost:12222/extension_helper.js';
	b.async = true;
	document.body.appendChild(b);

	// Check every half second to see if there is an accessToken in chrome storage
	// then set the dom to say that you're logged in or not
	setInterval(function() {
		chrome.storage.local.get(['accessToken'], function(items) {
			var holder = getOrSetElement('extension_logged_status', '');
			if (items.accessToken) holder.innerHTML = 'Logged In';
			else holder.innerHTML = 'Not Logged In';
		})
	}, 500);

	// The testing_background.js periodically sends the state of the popup as open or closed
	// Set this state in the DOM
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			var holder = getOrSetElement('extension_open_status', '');
			if ('popupState' in request) holder.innerHTML = request.popupState;
			return true;
		}
	);

})();
