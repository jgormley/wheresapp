angular.module('wheresapp.services', ['firebase'])
.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  var ref = new Firebase(firebaseUrl);
  return $firebaseAuth(ref);
}])

.factory('Items', function ($firebase, $rootScope, $firebaseArray, Auth, Session) {
  
  var uid = Auth.$getAuth().uid;
  var ref = new Firebase(firebaseUrl + "/" + uid + "/items");
  var items = $firebaseArray(ref);
  // once the items are loaded, sort them by distance
  items.$loaded().then(function(array) {
    console.log('items have been loaded, yippee! ', array);
    
    for (var i=0; i<array.length; i++) {
      console.log(i, array[i]);
      var item = array[i];
      var thisLatLong = new google.maps.LatLng( item.location.lat, item.location.long );
      var distance = google.maps.geometry.spherical.computeDistanceBetween(Session.getCurrentLocation(), thisLatLong);
      console.log('distance: ', distance);
      item.distance = distance;
    };
    
    // for (var i in array){
    //   var item = array[i];
    //   console.log(i);
    //   var thisLatLong = new google.maps.LatLng( item.location.lat, item.location.long );
    //   var distance = google.maps.geometry.spherical.computeDistanceBetween(Session.getCurrentLocation(), thisLatLong);
    //   console.log('distance: ', distance);
    //   item.distance = distance;
    // };

    sortedItems = items.sort(function(a,b){
      if(a.distance > b.distance) return 1;
      if(a.distance < b.distance) return -1;
      return 0;
    });
    
    array = sortedItems;
  });
  
  return {
    newItem: function(){
      return {
        "name": "",
        "description": "",
        "location": {
          "lat": 0,
          "long": 0
        }
      }
    },
    all: function () {
      console.log('get all items');
      return items;
    },
    remove: function (item) {
      items.$remove(item).then(function (ref) {
        ref.key() === item.$id; // true item has been removed
      });
    },
    get: function (itemId) {
      return items.$getRecord(itemId);
    },
    add: function (item) {
      console.log("adding item: [name:" + item.name + ", description:  " + item.description + ", location: " + item.location + "]");
      if (name && location) {
        var itemRecord = {
          name: name,
          description: message,
          location: location,
          createdAt: Firebase.ServerValue.TIMESTAMP
        };
        items.$add(itemRecord).then(function (data) {
          console.log("item added");
          // TODO: sort the array based on distance from user
        });
      }
      
      console.log("AddItemsCtrl.addItem()");
      items.$add(item);
    }
  }
})

.factory('Session', function() {
  var currentLocation;
  var Session = {
    getCurrentLocation: function(){return currentLocation;},
    updateSession: function() { 
      navigator.geolocation.getCurrentPosition(function(pos) {
        currentLocation = new google.maps.LatLng( pos.coords.latitude, pos.coords.longitude );
        console.log('session.updateSession, location = ', pos.coords.latitude, pos.coords.longitude);
      }, function(error) {
        alert('Unable to get location: ' + error.message);
      });
      
    }
  };
  Session.updateSession();
  return Session; 
});