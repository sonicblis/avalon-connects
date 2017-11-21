(function (angular) {
  function findController($state, uiGmapGoogleMapApi) {
    this.goHome = () => {
      $state.go('home');
    };
    this.map = {
      center: {
        latitude: 45,
        longitude: -73,
      },
      zoom: 12,
    };

    this.$onInit = function () {
      uiGmapGoogleMapApi.then(maps => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((geoInfo) => {
            this.map.center.latitude = geoInfo.coords.latitude;
            this.map.center.longitude = geoInfo.coords.longitude;
          });
        }
      });
    };
  }

  angular.module('AvalonConnects')
    .component('find', {
      templateUrl: 'views/find.html',
      controller: ['$state', 'uiGmapGoogleMapApi', findController],
    });
}(angular));

