
/*
 * GoAngular doesn't work like how I want it to work :(
 * So I rolled my own. :D
 */

angular.module('sign.remote', [])
.service('remote', function() {

  var remote = { }

  remote.connected = false
  remote.connecting = false

  return remote

})
