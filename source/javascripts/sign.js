

angular.module('sign', ['ui.slider', 'sign.display'])
.controller('MainController', function($scope) {

  $scope.self = {

    content: 'text',     /* type: text/clock */
    text: 'Attention',   /* (text) text to display */
    flash: true,
    rate: 100,           /* display flashing rate */

    width: 1280,         /* width of display */
    height: 720          /* height of display */

  }

  $scope.settings = $scope.self

  $scope.onresize = function(w, h) {
    $scope.self.width = w
    $scope.self.height = h
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




