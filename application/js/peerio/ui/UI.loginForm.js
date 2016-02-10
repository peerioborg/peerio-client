Peerio.UI.controller('loginForm', function($scope) {
	'use strict';
	$scope.login = {}
	$scope.login.version = Peerio.config.version
	$scope.login.showLoading = false
	$scope.login.login = function() {
		Peerio.storage.init($scope.login.username)
		$scope.login.username = $scope.login.username.toLowerCase()
		$scope.$root.$broadcast('login', {
			username: $scope.login.username,
			passOrPIN: $scope.login.passphrase,
			skipPIN: false
		})
	}
	$scope.$on('login', function(event, args) {
		$scope.login.showLoading = true
		//$scope.$apply()
		Peerio.user.login(args.username, args.passOrPIN, args.skipPIN, function() {
			if (Peerio.user.authTokens.length) {
				Peerio.network.getSettings(function(data) {
					$scope.login.username = ''
					$scope.login.passphrase = ''
					Peerio.user.firstName = data.firstName
					Peerio.user.lastName  = data.lastName
					Peerio.user.addresses = data.addresses
					var currLocale = Peerio.user.settings.localeCode;
					Peerio.user.settings = data.settings
					if(currLocale!== Peerio.user.settings.localeCode) {
						Peerio.user.settings.localeCode = currLocale;
						Peerio.network.updateSettings({localeCode:currLocale}, function () {});
					}
					Peerio.user.quota = data.quota
					$scope.$root.$broadcast('mainTopPopulate', null)
					$scope.$root.$broadcast('preferencesOnLogin', null)
					$scope.$root.$broadcast('contactsSectionPopulate', function() {
						$scope.$root.$broadcast('accountSettingsPopulate', null)
						$scope.$root.$broadcast('messagesSectionPopulate', function() {
							$('div.mainTopSectionTab[data-sectionLink=messages]').trigger('mousedown')
						})
						$scope.$root.$broadcast('filesSectionPopulate', null)
						$('div.loginScreen').addClass('slideUp')
						$('div.mainScreen').show()
						Peerio.UI.userMenuPopulate()
					})
				})
			} else {
				$scope.login.showLoading = false
				$scope.$apply()
				swal({
					title: document.l10n.getEntitySync('loginFailed').value,
					text: document.l10n.getEntitySync('loginFailedText').value,
					type: 'error',
					confirmButtonText: document.l10n.getEntitySync('OK').value
				}, function() {
					$('div.loginForm form').find('input').first().select()
					$('div.loginForm form').find('input').removeAttr('disabled')
				})
			}
		})
	})
	$scope.login.showSignupForm = function() {
		$scope.login.username   = ''
		$scope.login.passphrase = ''
		$('div.signupSplash').addClass('pullUp')
		setTimeout(function() {
			$('div.signupSplash').remove()
			$('div.signupFields').addClass('visible')
		}, 400)
		setTimeout(function() {
			$('div.signupFields').find('input')[0].focus()
		}, 700)
	}
	$scope.login.showPassphrase = function() {
		if ($('div.loginForm form [data-ng-model="login.passphrase"]').attr('type') === 'text') {
			$('div.loginForm form [data-ng-model="login.passphrase"]').attr('type', 'password')
			$('span.loginShowPassphraseEnable').show()
			$('span.loginShowPassphraseDisable').hide()
		}
		else {
			$('div.loginForm form [data-ng-model="login.passphrase"]').attr('type', 'text')
			$('span.loginShowPassphraseEnable').hide()
			$('span.loginShowPassphraseDisable').show()
		}
	}

	$scope.selectedLocale = Peerio.UI.localeCode;
	$scope.languageOptions = Peerio.UI.languageOptions;
	$scope.proxyType = "none";
	$scope.proxyTypes = [{ name: "none" }, { name: "Environ" }, { name: "HTTP" }, { name: "PAC" }];
	$scope.resetProxySetting = function() {
		Peerio.storage.db.remove('proxyAddress', function(err) {
if (err) { console.log(err) }
else { console.log('proxyAddress should be gone') }
			if ($('div.loginForm form [data-ng-model="proxyValue"]').attr('type') === 'text') {
				$('div.loginForm form [data-ng-model="proxyValue"]').attr('placeholder', '');
			}
		})
	}
	$scope.applyProxy = function() {
		var type = $scope.proxyType,
		    target = $scope.proxyValue;

console.log(type);
console.log(target);
		if (type === "HTTP" && typeof(target) === 'string') {
			//FIXME: check I can fetch https://app.peerio.com before applying
console.log('http requested');
			Peerio.storage.db.remove('proxyAddress', function() {
				Peerio.storage.db.put({ _id: 'proxyAddress', proxyHTTP: target}, function() {
console.log('new value set');
					swal({
						title: document.l10n.getEntitySync('confirmed').value,
						text: document.l10n.getEntitySync('confirmedLanguageText').value,
						type: 'success',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					}, function () {
						if (chrome) {
							var proxyConfig = {};
							if (0 === 0) {
								proxyConfig = {
									mode: "fixed_servers",
									rules: {
										proxyForHttps: {
											scheme: "http",
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
if ('undefined' !== typeof chrome.proxy) {
console.log('applying proxy config');
console.log(JSON.stringify(proxyConfig));
								chrome.proxy.settings.set({value: proxyConfig, scope: 'regular',
									function(config) {
										console.log(JSON.stringify(config));
									}});
	//							chrome.runtime.reload();
} else {
console.log('has chrome yet no .proxy');
}
//FIXME: proxy settings should be fetched from Peerio.storage.db
//FIXME: maybe some Promise magic to move io.connect in our
//	chrome.proxy.settings.set callback
//FIXME: handling auth-based proxies (user/pass & certificates!)
						} else console.log('reloads'); /*document.location.reload(true);*/
//		var gui = require('nw.gui');
//		gui.App.setProxyConfig('http://10.42.44.100:3128/');
					});
				});
			});
		} else if (type === "PAC" && typeof(target) === 'string') {
console.log('pac requested');
			//FIXME: check I can fetch https://app.peerio.com before applying
			Peerio.storage.db.remove('proxyAddress', function() {
				Peerio.storage.db.put({ _id: 'proxyAddress', proxyURL: target}, function() {
console.log('new value set');
					swal({
						title: document.l10n.getEntitySync('confirmed').value,
						text: document.l10n.getEntitySync('confirmedLanguageText').value,
						type: 'success',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					}, function () {
						if(chrome){
							chrome.runtime.reload();
						} else document.location.reload(true);
					});
				});
			});
		} else {
console.log('proxy reset');
			Peerio.storage.db.remove('proxyAddress', function() {
				swal({
					title: document.l10n.getEntitySync('confirmed').value,
					text: document.l10n.getEntitySync('confirmedLanguageText').value,
					type: 'success',
					confirmButtonText: document.l10n.getEntitySync('OK').value
				}, function () {
					if(chrome){
						chrome.runtime.reload();
					} else document.location.reload(true);
				});
			});
		}
	}
	$scope.changeLocale = function(){
		var defaultPouch = new PouchDB('_default')
		defaultPouch.get('localeCode', function(err, data) {
			defaultPouch.remove(data, function() {
				defaultPouch.put({
					_id: 'localeCode',
					localeCode: $scope.selectedLocale
				}, function() {
					swal({
						title: document.l10n.getEntitySync('confirmed').value,
						text: document.l10n.getEntitySync('confirmedLanguageText').value,
						type: 'success',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					}, function () {
						if(chrome){
							chrome.runtime.reload();
						} else document.location.reload(true);
					});
				});
			})
		});
	}
	document.l10n.ready(function () {
		if($scope.selectedLocale) return;
		$scope.selectedLocale = Peerio.UI.localeCode;
		$scope.$apply();
	})
});
