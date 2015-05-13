angular.module('wheresapp.controllers', ['ionic', 'wheresapp.controllers', 'wheresapp.services', 'firebase'])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    //console.log('Login Controller Initialized');

    // console.log($scope);
    // console.log($ionicModal);
    // console.log($state);
    // console.log($firebaseAuth);
    // console.log($ionicLoading);
    // console.log($rootScope);

    // TODO: the sample app shows reading this from the $scope param
    var ref = new Firebase(firebaseUrl);
    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.createUser = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function (user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.pwdForLogin
            }).then(function (authData) {
                console.log("Logged in as:" + authData.uid);
                console.log(authData);
                console.log(user);
                $rootScope.uid = authData.uid;
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                    });
                });
                $ionicLoading.hide();
                $state.go('tab.dash');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('DashCtrl', function($scope) {})

.controller('AddItemCtrl', function($scope, $state, $location, $rootScope, $firebaseArray, Items) {
  // TODO: should the firebase ref come from the services?
  //$scope.items = Items.all();
  var ref = new Firebase(firebaseUrl + "/" + $rootScope.uid + "/items");
  console.log($rootScope.uid);
  $scope.items = $firebaseArray(ref);
  
  $scope.addItem = function(item) {
    console.log("AddItemsCtrl.addItem()");
    $scope.items.$add(item);
    $state.go('tab.items');
  };
})

.controller('ItemsCtrl', function($scope, $state, $location, $rootScope, $firebaseArray, Items) {
  // TODO: should the firebase ref come from the services?
  //$scope.items = Items.all();
  var ref = new Firebase(firebaseUrl + "/" + $rootScope.uid + "/items");
  console.log($rootScope.uid);
  $scope.items = $firebaseArray(ref);
  
  $scope.remove = function(item) {
    $scope.items.remove(item);
  }
})

.controller('ItemDetailCtrl', function($scope, $stateParams, Items) {
  $scope.item = Items.get($stateParams.itemId);
})





.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})


.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
