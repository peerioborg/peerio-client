'use strict';

importScripts('../lib/socket.js')

var mySocket = (function() {
	var server = 'app.peerio.com';

	if (! io.proxyInitialized()) {
//check for PouchDB setting, if set to "none", ensure http_proxy is not defined
		io.proxyInit()
//check for PouchDB setting, if HTTP, feed proxyInit with the proper URL
//FIXME: PAC support
	}
	if (io.proxyDivertTo()) {
//FIXME: make sure tunnelServer actually listens on 127.0.0.1
		return io.connect('http://localhost:' + io.proxyDivertTo() + '/?protocol=wss&hostname=' + server + '&port=443' , { transports: ['websocket'] })
	} else {
		return io.connect('wss://' + server + ':443', { transports: ['websocket'] })
	}
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
