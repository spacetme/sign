
/*global goinstant, angular, _*/
/*
 * GoAngular doesn't work like how I want it to work :(
 * So I rolled my own. :D
 */

angular.module('sign.remote', [])
.service('Remote', function($q, $parse) {

  return function Remote(scope, watchExpression) {

    var remote = { }
    var connection
    var room
    var clients = [ ]

    clients.count = 0

    remote.connected = false
    remote.connecting = false
    remote.clients = clients

    remote.connect = function(roomName) {
      remote.connecting = true
      return $q.when(goinstant.connect('https://goinstant.net/f296a960c64f/staticshowdown', { room: roomName }))
        .then(function(result) {
          connection = result.connection
          room = result.rooms[0]
        })
        .then(function() {
          return synchronize(room.self().key('settings'), watchExpression)
        })
        .then(function() {
          setup()
        })
        .then(function() {
          remote.connected = true
          remote.roomName = roomName
        })
        .finally(function(e) {
          remote.connecting = false
        })
    }

    remote.disconnect = function() {
      var c = connection, r = room
      connection = null
      room = null
      clients.length = 0
      clients.count = 0
      remote.connected = false
      $q.when(r.leave()).finally(function() {
        c.disconnect()
      })
    }

    function synchronize(key, expression) {

      var knownValue = angular.copy(scope.$eval(expression))
      var setter = $parse(expression).assign

      function update(value, old) {
        if (angular.equals(value, knownValue)) {
          return false
        }
        if (old && !angular.equals(old, knownValue)) {
          return false
        }
        knownValue = angular.copy(value)
        return true
      }

      return key.set(knownValue)
        .then(function() {
          key.on('set', { bubble: true, local: false }, function(value) {
            if (update(value)) {
              angular.extend(scope.$eval(expression), value)
            }
          })
          scope.$watch(expression, function(value, old) {
            if (update(value, old)) {
              key.set(value)
            }
          }, true)
        })

    }

    function setup() {

      var users = null

      return watch(room.users, function(result) {

        clients.count = result.length

        result = result.filter(function(user) {
          return user.value && user.value.settings &&
            typeof user.value.settings == 'object' &&
            !user.value.settings.remote
        })

        clients.slice().forEach(function(client) {
          var index = _.findIndex(result, { name: client.id })
          if (index == -1) {
            client.unwatch()
            clients.splice(clients.indexOf(client), 1)
          }
        })

        result.forEach(function(user) {
          var id = user.name
          var client = _.find(clients, { id: id })
          if (client) {
            client.settings = angular.copy(user.value.settings)
            client.known = angular.copy(client.settings)
          } else {
            client = makeClient(id, user.value.settings)
            clients.push(client)
          }
        })
        
        function makeClient(id, settings) {
          var client = { id: id, settings: settings, known: angular.copy(settings) }
          client.unwatch = scope.$watch(function() {
            return client.settings
          }, send, true)
          function send(value, old) {
            if (angular.equals(client.known, value)) {
              console.log('no change')
            } else if (!angular.equals(client.known, old)) {
              client.settings = angular.copy(client.known)
              console.log('conflick')
            } else {
              client.known = angular.copy(value)
              return $q.when(room.user(id).key('settings').set(value))
                .catch(function(e) {
                  console.log('cannot change', e)
                  client.known = angular.copy(old)
                  client.settings = angular.copy(old)
                })
            }
          }
          return client
        }

      })

      function watch(key, callback) {
        var query = key.query({ })
        query.on('change', function(result) {
          scope.$apply(function() {
            callback(result)
          })
        })
        return query.execute()
      }

    }

    // remote.connect('lobby')

    return remote

  }

})




