(function (angular, firebase) {
  const firebaseConn = firebase.initializeApp({
    apiKey: "AIzaSyDdBkXHFKTIi30VQNqDid8w9ec9RTwvJy0",
    authDomain: "avalon-connects.firebaseapp.com",
    databaseURL: "https://avalon-connects.firebaseio.com",
    projectId: "avalon-connects",
    storageBucket: "avalon-connects.appspot.com",
    messagingSenderId: "37035393517"
  });

  const authProvider = new firebase.auth.GoogleAuthProvider();
  authProvider.addScope('https://www.googleapis.com/auth/calendar');

  angular.module('AvalonConnects')
    .constant('db', firebaseConn.database())
    .constant('auth', firebase.auth())
    .constant('authProvider', authProvider)
    .run(['$rootScope', '$q', '$window', function ($rootScope, $q) {
      let userPromise = $q.defer();
      $rootScope.whenUser = userPromise.promise;
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          $rootScope.user = user;
          $rootScope.user.$ref = firebaseConn.database().ref(`accounts/${user.uid}`);
          $rootScope.user.$ref.update({
            email: user.email,
            displayName: user.displayName,
            photoUrl: user.photoURL,
          });
          userPromise.resolve($rootScope.user);
          $rootScope.$digest();
        } else {
          $rootScope.user = null;
          userPromise = $q.defer();
          $rootScope.whenUser = userPromise.promise;
          $rootScope.$digest();
        }
      });
    }]);
}(angular, firebase));
