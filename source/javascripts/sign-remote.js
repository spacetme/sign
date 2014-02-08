
/*global goinstant*/
/*
 * GoAngular doesn't work like how I want it to work :(
 * So I rolled my own. :D
 */

angular.module('sign.remote', [])
.service('Remote', function($q) {

  return function Remote(scope) {

    var remote = { }
    var connection
    var room
    var clients

    remote.connected = false
    remote.connecting = false
    remote.clients = [ ]

    remote.connect = function(roomName) {
      remote.connecting = true
      return $q.when(goinstant.connect('https://goinstant.net/f296a960c64f/staticshowdown', { room: roomName }))
        .then(function(result) {
          connection = result.connection
          room = result.rooms[0]
          remote.connected = true
        })
        .then(function() {
          return room.self().key('stuff').set({ wow: 'doge', such: 'io' })
        })
        .then(function() {
          setup()
        })
        .finally(function(e) {
          remote.connecting = false
        })
    }

    function setup() {

      var users = null
      var clients = null

      watch(room.users, function(result) {
        users = result
      })

      watch(room.key('clients'), function(result) {
        clients = result
      })

      function watch(key) {
        var query = key.query({ })
        query.on('change', function(result) {
          console.log(result)
        })
        query.execute()
      }

    }

    return remote

  }

})




