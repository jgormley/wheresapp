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
  $scope.item = {"name": "", "description": "", "location": {"long": "", "lat": ""}};
  
  $scope.centerMapOnUser = function() {
    if(!$scope.map) {
      console.log('no map');
      return;
    }

    $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      $scope.item.location.lat = pos.coords.latitude;
      $scope.item.location.long = pos.coords.longitude;
      var latLng = new google.maps.LatLng( pos.coords.latitude, pos.coords.longitude );
      console.log(pos.coords.latitude, pos.coords.longitude);
      
      $scope.marker.setPosition(latLng);
      $scope.map.panTo(latLng);
      
      //$scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      
      $ionicLoading.hide();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };
  
  $scope.addItem = function(item) {
    Items.add(item);
    // clear out the model object so the next time we add an item, the form is reset
    $scope.item = {"name": "", "description": "", "location": {"long": "", "lat": ""}};
    $state.go('tab.items');
  };
  
  $scope.cancel = function(){
    $state.go('tab.items');
  };
  
  $scope.initialize = function() {
    console.log('initialize map');
    
    var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
    
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    $scope.marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      draggable:true
    });
    
    google.maps.event.addListener($scope.marker, 'dragend', function(){
      var latLong = $scope.marker.getPosition();
      $scope.item.location.lat = latLong.lat();
      $scope.item.location.long = latLong.lng();
      $scope.$apply();
    });
    
    $scope.map = map;
    
    $scope.centerMapOnUser();
  }
  
  // TODO: is there a better way to kick off the init method?
  $scope.initialize();
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
  };
  
  $scope.initialize = function() {
    console.log('initialize map');
    
    var myLatlng = new google.maps.LatLng($scope.item.location.lat,$scope.item.location.long);
    console.log(myLatlng);
    
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    $scope.marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      draggable:false
    });
    
    $scope.map = map;
  }
  
  // TODO: is there a better way to kick off the init method?
  $scope.initialize();
});
