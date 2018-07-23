(function (angular) {
  function controlController($root, $state, ministryService) {
    this.commitmentOptions = [
      { name: '3 Months', key: 3 },
      { name: '6 Months', key: 6 },
      { name: '9 Months', key: 9 },
      { name: '12 months', key: 12 },
    ];

    this.position = {};
    this.ministry = {};
    this.owner = {};

    this.saveMinistry = (ministry) => {
      const saveMinistry = ministry.$id ?
        ministryService.ministries.$save :
        ministryService.ministries.$add;
      saveMinistry(ministry).then(() => {
        this.addingMinistry = false;
        this.ministry = {};
      });
    };
    this.saveOwner = (owner) => {
      const saveOwner = owner.$id ?
        ministryService.ministryOwners.$save :
        ministryService.ministryOwners.$add;
      saveOwner(owner).then(() => {
        this.addingOwner = false;
        this.owner = {};
      });
    };
    this.savePosition = (position) => {
      const savePosition = position.$id ?
        ministryService.positions.$save :
        ministryService.positions.$add;
      savePosition(position).then(() => {
        this.addingPosition = false;
        this.position = {};
      });
    };

    this.editPosition = (position) => {
      this.position = position;
      this.addingPosition = true;
    };
    this.editMinistry = (ministry) => {
      this.ministry = ministry;
      this.addingMinistry = true;
    };
    this.editOwner = (owner) => {
      this.owner = owner;
      this.addingOwner = true;
    };

    this.$onInit = function () {
      if (!$root.user) {
        $root.blockedState = 'control';
        $state.go('login');
      } else {
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            this.ministries = ministryService.ministries;
            this.ministryOwners = ministryService.ministryOwners;
            this.positions = ministryService.positions;
          }
        });
      }
    };
  }

  angular.module('AvalonServes')
    .component('control', {
      templateUrl: 'views/control.html',
      controller: ['$rootScope', '$state', 'ministryService', controlController],
    });
}(angular));

