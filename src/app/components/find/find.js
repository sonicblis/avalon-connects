(function (angular) {
  function findController($state, $root, groupDateService) {
    this.goHome = () => {
      $state.go('home');
    };
    this.groups = [];
    this.userLocation = [];

    this.displayGroup = (evt, group) => {
      this.selectedGroup = group;
    };
    this.unselectGroup = () => {
      this.selectedGroup = null;
    };
    this.getDayDisplay = groupDateService.getDayDisplay;

    this.$onInit = function () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((geoInfo) => {
          this.userLocation[0] = geoInfo.coords.latitude;
          this.userLocation[1] = geoInfo.coords.longitude;
          $root.$digest();
        });
      }
      firebase.database().ref('accounts').on('child_added', (snap) => {
        const group = snap.val();
        group.position = [group.geoLocation.lat, group.geoLocation.lng];
        this.groups.push(group);
        $root.$digest();
      });
    };
  }

  angular.module('AvalonConnects')
    .component('find', {
      templateUrl: 'views/find.html',
      controller: ['$state', '$rootScope', 'groupDateService', findController],
    });
}(angular));

