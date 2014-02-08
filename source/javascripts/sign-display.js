
angular.module('sign.display', [])
.directive('display', function() {

  return {
    link: link,
    transclude: true,
    scope: { scale: '&scale' },
    template: '<div class="display-content" ng-transclude></div>'
  }

  function dim(element) {
    return element.offsetWidth + 'x' + element.offsetHeight
  }

  function link(scope, element, attrs) {

    var container = element[0]
    var content = element.find('.display-content')[0]

    scope.$watch(function() { return dim(container) + ',' + dim(content) }, resize)

    window.addEventListener('resize', resize)

    element.on('$destroy', function() {
      window.removeEventListener('resize', resize)
    })

    resize()

    function resize() {
      var scale = Math.min(
        container.offsetWidth / content.offsetWidth,
        container.offsetHeight / content.offsetHeight
      ) * (scope.scale() || 1)
      content.style.transform =
        content.style.MozTransform =
        content.style.WebkitTransform =
          'translate(-50%, -50%) scale(' + scale.toFixed(3) + ')'
    }

  }
  
})
