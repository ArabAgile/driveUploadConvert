
angular.module 'starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.config', 'ngResource', 'gapi']

  .run ['$ionicPlatform', ($ionicPlatform) ->
    $ionicPlatform.ready = ->
      if window.cordova && window.cordova.plugins.Keyboard
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar true

      if window.StatusBar 
        StatusBar.styleDefault()
        return
  ]

  .config ['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->
    
    # Main 
    $stateProvider

    .state 'app', {
      url: "/app"
      abstract: true
      templateUrl: "templates/menu.html"
      controller: 'AppCtrl'
    }

    # Home
    .state 'app.home', {
      url: "/home"
      views: {
        'menuContent' : {
          templateUrl: "templates/home.html"
          controller: 'HomeCtrl'
        }
      }
    }

    # Convert to json
    .state 'app.convert', {
      url: "/convert"
      views: {
        'menuContent' : {
          templateUrl: "templates/convert.html"
          controller: 'ConvertCtrl'
        }
      }

    }

    # Upload json
    .state 'app.upload', {
      url: "/upload"
      views: {
        'menuContent' : {
          templateUrl: "templates/upload.html"
          controller: 'UploadCtrl'
        }
      }

    }

    $urlRouterProvider.otherwise '/app/home'

    return
  ]

  .config ['$httpProvider', ($httpProvider) ->
    $httpProvider.defaults.useXDomain = true
    delete $httpProvider.defaults.headers.common['X-Requested-With']
    return
  ]

###
  .config ['$resourceProvider', ($resourceProvider) ->
    $resourceProvider.defaults.useXDomain = true
    delete $resourceProvider.defaults.headers.common['X-Requested-With']
    return
  ]
###
