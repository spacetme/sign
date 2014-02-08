

angular.module('sign', ['ui.slider', 'sign.display', 'ngTouch'])
.controller('MainController', function($scope) {

  $scope.self = {

    content: 'text',     /* type: text/clock */
    text: 'Attention',   /* (text) text to display */
    flash: true,
    rate: 100,           /* display flashing rate */

    width: 1280,         /* width of display */
    height: 720,         /* height of display */

    display: false,      /* true if this client is displaying */

  }
  
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
.directive('signDisplay', function($parse, signText) {

  return {
    link: link,
    scope: { 'settings': '=signDisplay' },
    templateUrl: '/templates/sign-display.html'
  }
  
  function link(scope, element, attrs) {
    scope.text = function() {
      return signText(scope.settings)
    }
  }

})


