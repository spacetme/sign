
angular.module('sign.time', [])
.service('timer', function() {
  var delta = 0
  return {
    now: function() {
      return new Date().getTime() + delta
    },
    shift: function(by) {
      delta += by
    }
  }
})
