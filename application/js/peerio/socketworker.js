'use strict';

importScripts('../lib/socket.js')

var mySocket = (function() {
	var server = 'app.peerio.com';

	if ('undefined' !== typeof chrome
	    && 'undefined' !== typeof chrome.proxy) {
		var proxyConfig = {};
		if (0 === 0) {
			proxyConfig = {
				mode: "fixed_servers",
				rules: {
					proxyForHttps: {
						scheme: "https",
						host: "10.42.44.100",
						port: 3128
					}
				}
			};
		} else if (0 === 1) {
			proxyConfig = {
				mode: "pac_script",
				pacScript: {
					url: "http://10.42.44.100/proxy.pac"
				}
			};
		}
		chrome.proxy.settings.set({value: proxyConfig, scope: 'regular',
			function(config) {
				console.log(JSON.stringify(config));
			}});
	} else {
//assuming nw.js, although we'd better come with some actual check
		var gui = require('nw.gui');
		gui.App.setProxyConfig('http://10.42.44.100:3128/');
	}
//FIXME: proxy settings should be fetched from Peerio.storage.db
//FIXME: maybe some Promise magic to move io.connect in our
//	chrome.proxy.settings.set callback
//FIXME: handling auth-based proxies (user/pass & certificates!)
	return io.connect('wss://' + server + ':443', { transports: ['websocket'] })
}());

onmessage = function(message) {
	message = message.data
	mySocket.emit(message.name, message.content, function(data) {
		postMessage({
			callbackID: message.callbackID,
			data: data
		})
	})
}

mySocket.on('receivedContactRequestsAvailable', function() {
	postMessage({
		received: 'receivedContactRequestsAvailable'
	})
})

mySocket.on('modifiedMessagesAvailable', function() {
	postMessage({
		received: 'modifiedMessagesAvailable'
	})
})

mySocket.on('uploadedFilesAvailable', function() {
	postMessage({
		received: 'uploadedFilesAvailable'
	})
})

mySocket.on('modifiedConversationsAvailable', function() {
	postMessage({
		received: 'modifiedConversationsAvailable'
	})
})

mySocket.on('newContactsAvailable', function() {
	postMessage({
		received: 'newContactsAvailable'
	})
})

mySocket.on('sentContactRequestsAvailable', function() {
	postMessage({
		received: 'sentContactRequestsAvailable'
	})
})

mySocket.on('contactsAvailable', function() {
	postMessage({
		received: 'contactsAvailable'
	})
})

mySocket.on('connect_error', function() {
	postMessage({
		received: 'error'
	})
})

mySocket.on('reconnecting', function() {
	postMessage({
		received: 'reconnecting'
	})	
})

mySocket.on('reconnect', function() {
	postMessage({
		received: 'reconnect'
	})
})
