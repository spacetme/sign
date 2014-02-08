

angular.module('sign', ['ui.slider'])
.controller('SettingsController', function($scope) {

  $scope.settings = {
    content: 'text',     /* type: text/clock */
    text: 'Attention',   /* (text) text to display */
    rate: 100            /* display flashing rate */
  }

})




