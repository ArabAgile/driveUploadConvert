angular.module('starter.services', []).factory('LoaderService', [
  '$rootScope', '$ionicLoading', function($rootScope, $ionicLoading) {
    return {
      show: function() {
        var options;
        options = {
          content: '<i class="icon ion-looping"></i>',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 500
        };
        $rootScope.loading = $ionicLoading.show(options);
      },
      hide: function() {
        $ionicLoading.hide();
      }
    };
  }
]).factory('AGHelper', [
  '$ionicPopup', function($ionicPopup) {
    var helper;
    helper = {};
    helper.alert = function(msg) {
      var options;
      options = {
        title: 'Alert',
        template: msg
      };
      $ionicPopup.alert(options);
    };
    return helper;
  }
]);
