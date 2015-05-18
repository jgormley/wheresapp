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
  $scope.item = Items.newItem();
  
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
    $scope.item = Items.newItem();
    $state.go('tab.items');
  };
  
  $scope.cancel = function(){
    $state.go('tab.items');
    // clear out the model object so the next time we add an item, the form is reset
    $scope.item = Items.newItem();
  };
  
  
  /**
   * The CenterControl adds a control to the map that recenters the map on Chicago.
   * This constructor takes the control DIV as an argument.
   * @constructor
   */
  function CenterControl(controlDiv, map) {

    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.borderRadius = '5px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.margin = '0.5em';
    controlUI.style.padding = '0.1em';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);
    
    var controlLink = document.createElement('a');
    controlLink.className = 'button button-icon icon ion-pinpoint map-float-over';
    controlUI.appendChild(controlLink);
    
    google.maps.event.addDomListener(controlUI, 'click', function() {
      $scope.centerMapOnUser();
    });

  }
  
  $scope.initialize = function() {
    var myLatLong = new google.maps.LatLng(43.07493,-89.381388);
    
    var mapOptions = {
      center: myLatLong,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    $scope.marker = new google.maps.Marker({
      position: myLatLong,
      map: map,
      draggable:true
    });
    
    google.maps.event.addListener($scope.marker, 'dragend', function(){
      var latLong = $scope.marker.getPosition();
      $scope.item.location.lat = latLong.lat();
      $scope.item.location.long = latLong.lng();
      $scope.$apply();
    });
    
    // Create the DIV to hold the control and
    // call the CenterControl() constructor passing
    // in this DIV.
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
    
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

.controller('MapCtrl', function($scope, $state, $stateParams, $compile, Items, Session) {
  $scope.items = Items.all();
  
  $scope.remove = function(item) {
    Items.remove(item);
  };
  
  $scope.clickTest = function() {
    // $scope.item = Items.get($stateParams.itemId);
    alert('Example of infowindow with ng-click: ' + $stateParams.itemId);
  };
  
  $scope.initialize = function() {
    var mapOptions = {
      center: Session.getCurrentLocation(),
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    for (var i=0; i<$scope.items.length; i++){
      var thisItem = $scope.items[i];
      var thisItemLatLong = new google.maps.LatLng(thisItem.location.lat, thisItem.location.long);
      
      //Marker + infowindow + angularjs compiled ng-click
      var contentString = "<div><a ng-click='clickTest()'>" + thisItem.name + "</a></div>";
      var compiled = $compile(contentString)($scope);

      var infowindow = new google.maps.InfoWindow({
        content: compiled[0]
      });

      var marker = new google.maps.Marker({
        position: thisItemLatLong,
        map: map,
        title: thisItem.name,
        draggable:false
      });

      google.maps.event.addListener(marker, 'click', function() {
        console.log(marker);
        for (var j in marker){
          console.log(j, marker[j]);
        }
        console.log('_____');
        infowindow.open(map,marker);
      });
    }
    
    $scope.map = map;
  }
  
  // TODO: is there a better way to kick off the init method?
  $scope.items.$loaded().then(function(array) {
    $scope.initialize();
  });
})

.controller('ItemDetailCtrl', function($scope, $state, $stateParams, Items) {
  $scope.item = Items.get($stateParams.itemId);

  $scope.remove = function() {
    Items.remove($scope.item);
    $state.go('tab.items');
  };
  
  $scope.initialize = function() {
    var myLatLong = new google.maps.LatLng($scope.item.location.lat,$scope.item.location.long);
    
    var mapOptions = {
      center: myLatLong,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    $scope.marker = new google.maps.Marker({
      position: myLatLong,
      map: map,
      draggable:false
    });
    
    $scope.map = map;
  }
  
  // TODO: is there a better way to kick off the init method?
  $scope.initialize();
});
