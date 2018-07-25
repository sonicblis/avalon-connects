(function (angular) {
  angular.module('AvalonServes')
    .service('ministryService', ['$q', '$firebaseArray', 'volunteerService', function ($q, $firebaseArray, volunteerService) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const loaded = [];
          this.positions = $firebaseArray(firebase.database().ref('positions'));
          this.ministries = $firebaseArray(firebase.database().ref('ministries'));
          this.ministryOwners = $firebaseArray(firebase.database().ref('ministryOwners'));
          this.volunteers = volunteerService.volunteers;
          loaded.push(this.positions.$loaded);
          loaded.push(this.volunteers.$loaded);

          this.ministries.$watch((args) => {
            if (args.event === 'child_changed' || args.event === 'child_added') {
              this.ministryOwners.$loaded(() => {
                const ministry = this.ministries.$getRecord(args.key);
                ministry.$ownerName = this.ministryOwners
                  .find(mo => mo.$id === ministry.ownerId).name;
                this.calculateVolunteers(ministry);
              });
            }
          });
          this.calculateVolunteers = (ministry) => {
            $q.all(loaded)
              .then(() => {
                ministry.$volunteers = this.positions
                  .filter(p => p.ministryId === ministry.$id)
                  .reduce((total, position) => {
                    const positionFilled = Number(this.volunteers.filter(v => v.positionId === position.$id && v.active).length);
                    total.needed += Number(Number.isNaN(position.minNeeded) ? 0 : position.minNeeded);
                    total.filled += positionFilled;
                    position.$filled = positionFilled;
                    return total;
                  }, { needed: 0, filled: 0 });
              });
          };
        } else {
          if (this.ministries.$destroy) this.ministries.$destroy();
          if (this.positions.$destroy) this.positions.$destroy();
          if (this.ministryOwners.$destroy) this.ministryOwners.$destroy();
        }
      });
    }]);
}(angular));
