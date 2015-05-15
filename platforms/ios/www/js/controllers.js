angular.module('wheresapp.controllers', ['ionic', 'wheresapp.controllers', 'wheresapp.services', 'firebase'])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    // TODO: read this from the $scope param
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
                $rootScope.uid = authData.uid;
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                    });
                });
                $ionicLoading.hide();
                $state.go('tab.items');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('InfoCtrl', function($scope) {})

.controller('AddItemCtrl', function($scope, $state, $ionicLoading, $compile, Items) {
  // TODO: put the model object somewhere reusable
  $scope.item = {"name": "", "description": "", "location": ""};
  
  function initialize() {
    console.log('initialize map');
    
    var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
    
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);
    
    console.log('map ', map);
    //Marker + infowindow + angularjs compiled ng-click
    var contentString = "<div><a ng-click='clickTest()'>You clicked me!</a></div>";
    var compiled = $compile(contentString)($scope);

    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });

    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Uluru (Ayers Rock)'
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });

    $scope.map = map;
    console.log('$scope.map = ', map);
  }
  // TODO: is there risk of not waiting for the load event?
  //google.maps.event.addDomListener(window, 'load', initialize);
  initialize();
  
  $scope.centerOnMe = function() {
    if(!$scope.map) {
      console.log('no map');
      return;
    }

    $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      $scope.item.location = pos.coords.latitude + ', ' + pos.coords.longitude;
      console.log(pos.coords.latitude, pos.coords.longitude);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $ionicLoading.hide();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };
  
  $scope.clickTest = function() {
    alert('Example of infowindow with ng-click')
  };
  
  
  
  $scope.addItem = function(item) {
    Items.add(item);
    // clear out the model object so the next time we add an item, the form is reset
    $scope.item = {"name": "", "description": "", "location": ""};
    $state.go('tab.items');
  };
  
  $scope.cancel = function(){
    $state.go('tab.items');
  }
})

.controller('ItemsCtrl', function($scope, $state, Items) {
  $scope.items = Items.all();
  
  $scope.remove = function(item) {
    Items.remove(item);
  }
})

.controller('ItemDetailCtrl', function($scope, $state, $stateParams, Items) {
  $scope.item = Items.get($stateParams.itemId);

  $scope.remove = function() {
    Items.remove($scope.item);
    $state.go('tab.items');
  }
});
