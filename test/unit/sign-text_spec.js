
/*global inject*/
describe('sign.text', function() {
  
  beforeEach(module('sign.text'))
  beforeEach(module('sign.time'))

  function MockTimer() {
    var timer = {
          now: function() { return timer.time },
          time: 0
        }
    return timer
  }

  var timer

  beforeEach(module(function($provide) {
    $provide.value('timer', timer = new MockTimer())
  }))

  describe('signText', function() {
    
    var signText

    beforeEach(inject(function(_signText_) {
      signText = _signText_
    }))

    it('On text, display text', function() {
      var result = signText({ content: 'text', text: 'Hello world' })
      expect(result.text).toEqual('Hello world')
      expect(result.next).toBeNull()
    })

  })

  describe('signTime', function() {

    var signTime

    beforeEach(inject(function(_signTime_) {
      signTime = _signTime_
    }))

    function check(options, time, next, local) {
      var result = signTime(options)
      expect(result.time).toEqual(time)
      if (next !== undefined) expect(result.next).toEqual(next)
      expect(result.local).toEqual(local || false)
      return result
    }

    it('clock, return the time', function() {
      timer.time = 123123
      check({ timeMode: 'clock' }, 123123, 1000 - 123, true)
    })

    describe('stopwatch', function() {
      it('when not running, should return the carry', function() {
        timer.time = 123123
        check({ timeMode: 'stopwatch', stopwatchRunning: null, stopwatchCarry: 555 },
          555, null)
      })
      it('when running, should return the carry plus elapsed time', function() {
        timer.time = 123123
        var elapsed = 555 + 123123 - 120000
        check({ timeMode: 'stopwatch', stopwatchRunning: 120000, stopwatchCarry: 555 },
          elapsed, 1000 - (elapsed % 1000), null)
      })
    })

    describe('countdown', function() {
      it('return the time left', function() {
        timer.time = 123123
        var timeLeft = 555555 - 123123
        var result = check({ timeMode: 'countdown', countdownTarget: 555555 },
          timeLeft, undefined, false)
        expect((timeLeft - result.next) % 1000 == 999)
      })
      it('return null when timer not set', function() {
        timer.time = 123123
        check({ timeMode: 'countdown', countdownTarget: null }, null, null, false)
      })
      it('return null when time passed', function() {
        timer.time = 123123
        check({ timeMode: 'countdown', countdownTarget: 123122 }, null, null, false)
      })
    })

    describe('unknown modes', function() {
      it('should not throw', function() {
        signTime({ timeMode: 'tnarset' })
      })
    })

    describe('display', function() {
      it('return hours, minutes, seconds', function() {
        var result = signTime.display(86400 * 1000 * 2 + 3600 * 1000 * 18 + 60 * 1000 * 7 + 1234)
        expect(result.hours).toEqual(18)
        expect(result.minutes).toEqual(7)
        expect(result.seconds).toEqual(1)
      })
      it('return null for null', function() {
        expect(signTime.display(null)).toBeNull()
      })
    })

    describe('text', function() {
      function format(h, m, s, style, result) {
        it('should format ' + style + ' for ' + h + ' ' + m + ' ' + s + ' -> ' + result, function() {
          expect(signTime.text({ hours: h, minutes: m, seconds: s }, style)).toEqual(result)
        })
      }
      format(1, 2, 3, 'hms', '1:02:03')
      format(1, 2, 3, 'ms', '2:03')
      format(1, 2, 3, 'minutes', '62')
      format(1, 2, 3, 'seconds', '3723')
      it('should return a dash for null', function() {
        expect(signTime.text(null, 'wtf')).toEqual('-')
      })
      it('should not throw on invalid style', function() {
        signTime.text({ hours: 1, minutes: 2, seconds: 3 }, 'tnarset')
      })
    })

  })


})









