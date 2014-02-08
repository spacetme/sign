
/*global goinstant*/
/*
 * GoAngular doesn't work like how I want it to work :(
 * So I rolled my own. :D
 */

angular.module('sign.remote', [])
.service('remote', function($q) {

  var remote = { }
  var connection

  remote.connected = false
  remote.connecting = false
  remote.connect = function(room) {
    remote.connecting = true
    return $q.when(goinstant.connect('https://goinstant.net/f296a960c64f/staticshowdown', { room: room }))
      .then(function() {
        remote.connected = true
      })
      .finally(function(e) {
        remote.connecting = false
      })
  }

  return remote

})
