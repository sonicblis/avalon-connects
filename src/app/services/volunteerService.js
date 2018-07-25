(function (angular) {
  angular.module('AvalonServes')
    .service('volunteerService', ['$firebaseArray', function ($firebaseArray) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.volunteers = $firebaseArray(firebase.database().ref('volunteers'));

          this.volunteers.$watch((e) => {
            if (['child_added','child_changed'].includes(e.event)) {
              const volunteer = this.volunteers.$getRecord(e.key);
              volunteer.active = !(!volunteer.active);
              volunteer.isPOC = !(!volunteer.isPOC);
            }
          });
        }
      });
    }]);
}(angular));
