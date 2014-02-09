
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
.service('stopwatch', function(timer) {
  return {
    startStop: function(settings) {
      if (settings.stopwatchRunning != null) {
        settings.stopwatchCarry += (timer.now() - settings.stopwatchRunning)
        settings.stopwatchRunning = null
      } else {
        settings.stopwatchRunning = timer.now()
      }
    },
    reset: function(settings) {
      settings.stopwatchCarry = 0
      settings.stopwatchRunning = null
    }
  } 
})
