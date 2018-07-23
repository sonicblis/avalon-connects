(function (angular) {
  angular.module('AvalonServes')
    .service('volunteerService', ['$firebaseArray', function ($firebaseArray) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.volunteers = $firebaseArray(firebase.database().ref('volunteers'));
        }
      });
    }]);
}(angular));
