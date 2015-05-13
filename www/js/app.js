// Ionic wheresapp App

// GLOBAL vars
var firebaseUrl = "https://wheresapp.firebaseio.com";


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'wheresapp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'wheresapp.services' is found in services.js
// 'wheresapp.controllers' is found in controllers.js
angular.module('wheresapp', ['ionic', 'firebase', 'wheresapp.controllers', 'wheresapp.services'])

.run(function($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    // To Resolve Bug
    ionic.Platform.fullScreen();

    $rootScope.getFirebaseUrl = function(){
      return firebaseUrl;
    }

    $rootScope.displayName = null;
    $rootScope.uid = null;

    Auth.$onAuth(function (authData) {
      if (authData) {
        console.log("Logged in as:", authData.uid);
        $rootScope.uid = authData.uid;
      } else {
        console.log("Logged out");
        $ionicLoading.hide();
        $location.path('/login');
      }
    });

    $rootScope.logout = function () {
      console.log("Logging out from the app");
      $ionicLoading.show({
        template: 'Logging Out...'
      });
      Auth.$unauth();
    }

    $rootScope.addItem = function(){
      console.log("add an item now");
      $location.path('/additem');
    }
    
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the home page
      if (error === "AUTH_REQUIRED") {
        console.log("auth required, sending to login page");
        $location.path("/login");
      }
    });
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // State to represent Login View
  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl',
    resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth",
        function (Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete
          return Auth.$waitForAuth();
        }]
    }
  })

  // State to represent add item View
  .state('additem', {
    url: "/additem",
    templateUrl: "templates/additem.html",
    controller: 'AddItemCtrl',
    resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth",
        function (Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete
          return Auth.$waitForAuth();
        }]
    }
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
    resolve: {
      // controller will not be loaded until $requireAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth",
        function (Auth) {
          // $requireAuth returns a promise so the resolve waits for it to complete
          // If the promise is rejected, it will throw a $stateChangeError (see above)
          return Auth.$requireAuth();
        }]
    }
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.items', {
      url: '/items',
      views: {
        'tab-items': {
          templateUrl: 'templates/tab-items.html',
          controller: 'ItemsCtrl'
        }
      }
    })
    .state('tab.item-detail', {
      url: '/items/:itemId',
      views: {
        'tab-items': {
          templateUrl: 'templates/item-detail.html',
          controller: 'ItemDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
