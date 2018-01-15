(function (angular) {
  function controlController($root) {
    this.clearAttendees = () => {
      this.attendingSnapshot.forEach((account) => {
        account.ref.update({ attending: null });
      });
    };

    this.$onInit = function () {
      firebase.database()
        .ref('accounts')
        .orderByChild('attending')
        .startAt('')
        .once('value', (snapshot) => {
          this.attendingSnapshot = snapshot;
          this.numberAttending = snapshot.numChildren();
          $root.$digest();
        });
    };
  }

  angular.module('AvalonConnects')
    .component('control', {
      templateUrl: 'views/control.html',
      controller: ['$rootScope', controlController],
    });
}(angular));

