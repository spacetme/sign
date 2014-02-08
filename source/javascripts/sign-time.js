
angular.module('sign.time', [])
.service('timer', function() {
  return {
    now: function() {
      return new Date().getTime()
    }
  }
})
