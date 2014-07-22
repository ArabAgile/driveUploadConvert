angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.config', 'ngResource', 'gapi']).run([
  '$ionicPlatform', function($ionicPlatform) {
    return $ionicPlatform.ready = function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    };
  }
]).config([
  '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    }).state('app.home', {
      url: "/home",
      views: {
        'menuContent': {
          templateUrl: "templates/home.html",
          controller: 'HomeCtrl'
        }
      }
    }).state('app.convert', {
      url: "/convert",
      views: {
        'menuContent': {
          templateUrl: "templates/convert.html",
          controller: 'ConvertCtrl'
        }
      }
    }).state('app.convertLocal', {
      url: "/convert-local",
      views: {
        'menuContent': {
          templateUrl: "templates/convert-local.html",
          controller: 'ConvertLocalCtrl'
        }
      }
    }).state('app.upload', {
      url: "/upload",
      views: {
        'menuContent': {
          templateUrl: "templates/upload.html",
          controller: 'UploadCtrl'
        }
      }
    });
    $urlRouterProvider.otherwise('/app/home');
  }
]).config([
  '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
]);


/*
  .config ['$resourceProvider', ($resourceProvider) ->
    $resourceProvider.defaults.useXDomain = true
    delete $resourceProvider.defaults.headers.common['X-Requested-With']
    return
  ]
 */
