(function (angular) {
  angular.module('AvalonServes')
    .service('ministryService', ['$firebaseArray', function ($firebaseArray) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.positions = $firebaseArray(firebase.database().ref('positions'));
          this.ministries = $firebaseArray(firebase.database().ref('ministries'));
          this.ministryOwners = $firebaseArray(firebase.database().ref('ministryOwners'));

          this.ministries.$watch((args) => {
            if (args.event === 'child_changed' || args.event === 'child_added') {
              this.ministryOwners.$loaded(() => {
                const ministry = this.ministries.$getRecord(args.key);
                ministry.$ownerName = this.ministryOwners.find(mo => mo.$id === ministry.ownerId).name;
              });
            }
          });
        } else {
          if (this.ministries.$destroy) this.ministries.$destroy();
          if (this.positions.$destroy) this.positions.$destroy();
          if (this.ministryOwners.$destroy) this.ministryOwners.$destroy();
        }
      });
    }]);
}(angular));
