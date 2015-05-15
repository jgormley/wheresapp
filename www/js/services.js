angular.module('wheresapp.services', ['firebase'])
.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  var ref = new Firebase(firebaseUrl);
  return $firebaseAuth(ref);
}])

.factory('Items', function ($firebase, $rootScope, $firebaseArray, Auth) {
  
  var uid = Auth.$getAuth().uid;
  var ref = new Firebase(firebaseUrl + "/" + uid + "/items");
  var items = $firebaseArray(ref);

  return {
    all: function () {
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
        });
      }
      
      console.log("AddItemsCtrl.addItem()");
      items.$add(item);
        
    }
  }
});

