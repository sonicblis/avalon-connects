(function (angular, firebase) {
  const firebaseConn = firebase.initializeApp({
    apiKey: 'AIzaSyCAdDcsPJqvo4LMqP17pYyvymlpdsR0Ug8',
    authDomain: 'avalon-serves.firebaseapp.com',
    databaseURL: 'https://avalon-serves.firebaseio.com',
    projectId: 'avalon-serves',
    storageBucket: '',
    messagingSenderId: '111973435598',
  });

  const authProvider = new firebase.auth.GoogleAuthProvider();
  authProvider.addScope('https://www.googleapis.com/auth/calendar');

  angular.module('AvalonServes')
    .constant('db', firebaseConn.database())
    .constant('auth', firebase.auth())
    .constant('authProvider', authProvider)
    .run(['$rootScope', '$q', '$window', 'refService', '$state', function ($rootScope, $q, window, refService, $state) {
      let userPromise = $q.defer();
      $rootScope.whenUser = userPromise.promise;
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          $rootScope.user = user;
          userPromise.resolve($rootScope.user);
          $rootScope.$digest();
          if ($rootScope.blockedState) {
            $state.go($rootScope.blockedState);
          }
        } else {
          $rootScope.user = null;
          userPromise = $q.defer();
          $rootScope.whenUser = userPromise.promise;
          refService.offAll();
          $rootScope.$digest();
        }
      });
    }]);
}(angular, firebase));
