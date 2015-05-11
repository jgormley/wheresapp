angular.module('wheresapp.services', ['firebase'])
.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  var ref = new Firebase(firebaseUrl);
  return $firebaseAuth(ref);
}])

.factory('Items', function ($firebase) {

    var ref = new Firebase(firebaseUrl);
    var items;

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
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === parseInt(itemId)) {
                    return items[i];
                }
            }
            return null;
        },
        add: function (name, description, location) {
            console.log("adding item: [name:" + name + ", description:  " + description + ", location: " + location + "]");
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
        }
    }
})


.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
