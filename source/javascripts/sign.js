

angular.module('sign', ['ui.slider', 'sign.display', 'sign.time', 'ngTouch', 'sign.remote'])
.controller('MainController', function($scope) {

  $scope.self = {

    content: 'text',     /* type: text/time */
    text: '<b>Flashing\nSign</b>',   /* (text) text to display */

    timeMode: 'clock',   /* mode: clock/stopwatch/timer */

    flash: false,
    flashRate: 180,         /* display flashing rate */
    flashSequence: [1, 0],  /* the sequence of the flash pattern */

    width: 1280,         /* width of display */
    height: 720,         /* height of display */

    display: false,      /* true if this client is displaying */

  }

  $scope.main = { page: 'remote' }
  
  $scope.settings = $scope.self

  $scope.onresize = function(w, h) {
    $scope.self.width = w
    $scope.self.height = h
  }

  $scope.previewSize = function() {
    var w = $scope.self.width
      , h = $scope.self.height
    var size = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
    var scale = 0.2 + 0.7 * Math.exp(size / -500)
    return {
      width: $scope.self.width * scale,
      height: $scope.self.height * scale
    }
  }

})
.controller('SettingsController', function($scope) {
})
.directive('onWindowResize', function($parse) {
  
  return { link: link }

  function link(scope, element, attrs) {

    var action = $parse(attrs.onWindowResize)

    window.addEventListener('resize', resize)

    element.on('$destroy', function() {
      window.removeEventListener('resize', resize)
    })

    setTimeout(resize, 0)

    function resize() {
      scope.$apply(function() {
        action(scope, { width: window.innerWidth, height: window.innerHeight })
      })
    }

  }
  
})
.service('signText', function($sce) {
  return function text(settings) {
    return $sce.trustAsHtml(settings.text)
  }
})
.directive('signDisplay', function($parse, signText, timer) {

  return {
    link: link,
    scope: { 'settings': '=signDisplay' },
    templateUrl: '/templates/sign-display.html'
  }

  function link(scope, element, attrs) {

    var flashTimeout = null

    element.on('$destroy', function() {
      clearTimeout(flashTimeout)
    })

    scope.text = function() {
      return signText(scope.settings)
    }

    scope.$watch('settings.flash', checkFlash)
    scope.$watch('settings.flashSequence', checkFlash, true)
    scope.$watch('settings.flashRate', checkFlash)

    function checkFlash() {
      var info = getFlashInfo()
      clearTimeout(flashTimeout)
      if (info.next) {
        flashTimeout = setTimeout(function() {
          element.toggleClass('flashing', !info.flashing)
          checkFlash()
        }, info.next)
      } else {
        element.toggleClass('flashing', !!info.flashing)
      }
    }

    function getFlashInfo() {

      var settings = scope.settings
      var now = timer.now()
      if (!settings.flash) {
        return { flashing: false, next: null }
      }

      var period = 60000 / settings.flashRate
      var periodNumber = Math.floor(now / period)
      var next = (periodNumber + 1) * period
      var flashing = settings.flashSequence[periodNumber % settings.flashSequence.length]

      return { flashing: flashing, next: next - now }

    }

    checkFlash()

  }

})
.controller('RemoteController', function($scope, remote) {

  $scope.remote = remote


  $scope.clientPreviewSize = function(client) {
    return {
      width: client.settings.width / 8,
      height: client.settings.height / 8,
    }
  }

  $scope.clients = [
    {
      id: 'abcdef',
      settings: {
        content: 'text',
        text: 'I am A',

        timeMode: 'clock',

        flash: true,
        flashRate: 16,
        flashSequence: [1, 0],

        width: 1280,
        height: 720,

        display: false,
      }
    },
    {
      id: 'self',
      settings: $scope.self
    },
    {
      id: 'ghijkl',
      settings: {
        content: 'text',
        text: 'What is this?',

        timeMode: 'clock',

        flash: true,
        flashRate: 15,
        flashSequence: [1, 0],

        width: 768,
        height: 1024,

        display: false,
      }
    }
  ]
  
})
.controller('RemoteConnectController', function($scope) {

  $scope.roomId = getInitalRoomId()

  $scope.joinRoom = function() {
    if ($scope.roomId) $scope.remote.connect($scope.roomId)
  }

  $scope.remote.connect('lobby')

  function getInitalRoomId() {
    return getRandomRoomId()
  }

  function getRandomRoomId() {
    var id = ''
    for (var i = 0; i < 9; i ++) id += Math.floor(Math.random() * 10)
    return id
  }
  
})
.controller('RemoteSettingsController', function($scope) {

  $scope.settings = null

  $scope.edit = function(client) {
    $scope.settings = JSON.parse(JSON.stringify(client.settings))
    $scope.target = client.id
  }

})


