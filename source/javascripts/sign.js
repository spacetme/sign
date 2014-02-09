

/*global _, angular*/

angular.module('sign', ['ui.slider', 'sign.display', 'sign.time', 'ngTouch', 'sign.remote', 'sign.text'])
.controller('MainController', function($scope, Remote) {

  $scope.self = {

    content: 'text',          /* type: text/time */
    text: 'Flashing\nSign',   /* (text) text to display */

    timeMode: 'clock',      /* mode: clock/stopwatch/countdown */
    timeFormat: 'hms',      /* format: hms/ms/minutes/seconds */

    flash: true,
    flashRate: 180,         /* display flashing rate */
    flashSequence: [1, 0],  /* the sequence of the flash pattern */

    width: 1280,          /* width of display */
    height: 720,          /* height of display */

    display: false,       /* true if this client is displaying */
    remote:  false,       /* true if this client is a remote control */

    stopwatchRunning: null,   /* null: stopped, value: start time */
    stopwatchCarry:   0,      /* the carry */

    countdownTarget: null,    /* null: no countdown, value: end time */

    fontFamily: 'Helvetica',
    fontBold:   true,

  }

  $scope.remote = new Remote($scope, 'self')

  $scope.$watch('main.page == "remote" && !self.display', function(value) {
    $scope.self.remote = value
  })

  $scope.main = { page: 'settings' }
  
  $scope.settings = $scope.self

  $scope.onresize = function(w, h) {
    $scope.self.width = w
    $scope.self.height = h
  }

  $scope.previewSize = function(settings) {
    var w = $scope.self.width
      , h = $scope.self.height
    var size = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
    var scale = 0.2 + 0.7 * Math.exp(size / -500)
    return {
      width: settings.width * scale,
      height: settings.height * scale
    }
  }

})
.controller('SettingsController', function($scope) {

  $scope.save = function() {
    $scope.settings.display = true
  }

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
.directive('signDisplay', function($parse, signText, timer, $timeout, $sce) {

  return {
    link: link,
    scope: { 'settings': '=signDisplay' },
    templateUrl: '/templates/sign-display.html'
  }

  function link(scope, element, attrs) {

    var flashTimeout = null
    var textTimeout = null
    var info = { text: '...' }

    element.on('$destroy', function() {
      if (flashTimeout) clearTimeout(flashTimeout)
      if (textTimeout) $timeout.cancel(textTimeout)
    })

    scope.text = function() {
      return $sce.trustAsHtml(info.text)
    }

    scope.$watch('settings.flash', checkFlash)
    scope.$watch('settings.flashSequence', checkFlash, true)
    scope.$watch('settings.flashRate', checkFlash)
    scope.$watch('settings', updateText, true)

    function updateText() {
      $timeout.cancel(textTimeout)
      info = signText(scope.settings)
      if (info.next != null) textTimeout = $timeout(updateText, info.next)
    }

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
.controller('RemoteController', function($scope, $sce) {

  $scope.clients = $scope.remote.clients

  $scope.clientCountText = function() {
    var count = $scope.clients.count - 1
    if (count === 0) {
      return $sce.trustAsHtml('There are no connected clients.')
    } else if (count == 1) {
      return $sce.trustAsHtml('There is <strong>one</strong> connected client.')
    } else if (count > 1) {
      return $sce.trustAsHtml('There are <strong>' + count + '</strong> connected clients.')
    } else {
      return $sce.trustAsHtml('...')
    }
  }

  $scope.clientPreviewSize = function(client) {
    var scale = 1/12 + (1/8 - 1/12) * Math.min(1, Math.max(0, 1 + ($scope.self.width - 720) / 360))
    return {
      width: client.settings.width * scale,
      height: client.settings.height * scale,
    }
  }
  
})
.controller('RemoteConnectController', function($scope) {

  $scope.roomId = getInitalRoomId()

  $scope.joinRoom = function() {
    if ($scope.roomId) $scope.remote.connect($scope.roomId)
  }

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
  $scope.target = null

  $scope.edit = function(client) {
    $scope.settings = angular.copy(client.settings)
    $scope.settings.display = true
    $scope.target = client.id
  }

  $scope.save = function() {
    var item = _.find($scope.clients, { id: $scope.target })
    if (item) {
      angular.extend(item.settings, $scope.settings)
    }
  }

})
.directive('timeFormat', function(signTime) {
  return {
    templateUrl: '/templates/time-format.html',
    scope: {
      settings: '=settings',
      format: '@timeFormat',
      name: '@timeFormatName'
    },
    link: function(scope, element, attrs) {
      scope.example = function() {
        var result = signTime(scope.settings)
        var text = signTime.format(result, scope.format)
        return text
      }
    }
  }
})
.controller('StopwatchController', function($scope, stopwatch) {
  $scope.startStop = function() {
    stopwatch.startStop($scope.settings)
  }
  $scope.reset = function() {
    stopwatch.reset($scope.settings)
  }
})
.controller('CountdownController', function($scope, timer) {
  $scope.duration = 25
  $scope.set = function() {
    $scope.settings.countdownTarget = timer.now() + $scope.duration * 60 * 1000
  }
  $scope.reset = function() {
    $scope.settings.countdownTarget = null
  }
})


