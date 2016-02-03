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
			}
			else {
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
	$scope.proxyType = "PAC";
	$scope.proxyTypes = [{ name: "HTTP" }, { name: "PAC" }];
	if (Peerio.UI.proxyURL !== undefined && Peerio.UI.proxyURL !== false) {
console.log('setting proxyURL from ' + Peerio.UI.proxyURL);
		$scope.proxyValue = Peerio.UI.proxyURL;
	} else if (Peerio.UI.proxyHTTP !== undefined && Peerio.UI.proxyHTTP !== false) {
console.log('setting proxyHTTP from ' + Peerio.UI.proxyHTTP);
		$scope.proxyType  = 'HTTP';
		$scope.proxyValue = Peerio.UI.proxyHTTP;
	} else {
console.log('not setting proxy since');
console.log(Peerio.UI.proxyURL);
console.log(Peerio.UI.proxyHTTP);
		$scope.proxyValue = '';
	}
	$scope.resetProxySetting = function() {
		var defaultPouch = new PouchDB('_default')
		defaultPouch.remove('proxyAddress', function() {})
		Peerio.UI.proxyHTTP = false;
		Peerio.UI.proxyURL = false;
		$scope.proxyValue = '';
	}
	$scope.applyProxy = function() {
		var type = $scope.proxyType,
		    target = $scope.proxyValue,
		    defaultPouch = new PouchDB('_default');

console.log(type);
console.log(target);
		if (type === "HTTP" && typeof(target) === 'string') {
			//FIXME: check I can fetch https://google.com
console.log('http requested');
			defaultPouch.remove('proxyAddress', function() {
console.log('reset processed');
				defaultPouch.put({ _id: 'proxyAddress', proxyHTTP: target}, function(){ console.log('put');});
			});
			//FIXME: some reload magic that would re-open our socket
		} else if (type === "PAC" && typeof(target) === 'string') {
console.log('pac requested');
			//FIXME: check I can fetch https://google.com
			defaultPouch.remove('proxyAddress', function() {
console.log('reset processed');
				defaultPouch.put({ _id: 'proxyAddress', proxyURL: target}, function(){ console.log('put');});
			});
			//FIXME: some reload magic that would re-open our socket
		} else {
console.log('wtfwtfwtf');
			//FIXME: an error message would be nice
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
