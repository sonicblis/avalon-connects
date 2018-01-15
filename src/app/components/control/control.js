(function (angular) {
  function controlController() {
    this.clearAttendees = () => {
      firebase.database()
        .ref('accounts')
        .orderByChild('attending')
        .startAt('')
        .once('value', (snapshot) => {
          snapshot.forEach((account) => {
            account.ref.update({ attending: null });
          });
      });
    };
  }

  angular.module('AvalonConnects')
    .component('control', {
      templateUrl: 'views/control.html',
      controller: [controlController],
    });
}(angular));

