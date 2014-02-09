
angular.module('sign.text', ['sign.time'])
.service('signTime', function(timer) {

  function signTime(settings) {
    return signTime.modes[settings.timeMode](settings)
  }

  signTime.modes = {
    clock: function(settings) {
      return { time: timer.now(), next: 1000 - (timer.now() % 1000), local: true }
    },
    stopwatch: function(settings) {
      if (settings.stopwatchRunning != null) {
        var elapsed = settings.stopwatchCarry + timer.now() - settings.stopwatchRunning
        return { time: elapsed, next: 1000 - (elapsed % 1000), local: false }
      } else {
        return { time: settings.stopwatchCarry, next: null, local: false }
      }
    },
    countdown: function(settings) {
      var ended = { time: null, next: null, local: false }
      if (settings.countdownTarget == null) {
        return ended
      } else {
        var timeLeft = settings.countdownTarget - timer.now()
        if (timeLeft < 0) {
          return ended
        } else {
          return { time: timeLeft, next: timeLeft % 1000 + 1, local: false }
        }
      }
    }
  }

  signTime.display = function(time) {
    if (time == null) return null
    return {
      hours: Math.floor((time % 86400000) / 3600000),
      minutes: Math.floor((time % 3600000) / 60000),
      seconds: Math.floor((time % 60000) / 1000)
    }
  }

  signTime.text = function(display, style) {
    return signTime.text.styles[style](display)
  }

  function t(x) {
    return (x < 10 ? '0' : '') + x
  }

  signTime.text.styles = {
    hms: function(display) {
      return display.hours + ':' + t(display.minutes) + ':' + t(display.seconds)
    }
  }

  return signTime

})
.service('signText', function(signTime) {

  function text(settings) {
    return (text.modes[settings.content] || defaultMode)(settings)
  }

  function defaultMode(settings) {
    return { text: 'Unknown content type!', next: null }
  }

  text.modes = {
    text: function(settings) {
      return { text: settings.text, next: null }
    },
    time: function(settings) {
      var result = signTime(settings)
      return { text: '' + result, next: result.next }
    }
  }

  return text

})
