(function (angular) {
  function homeController() {

  }

  angular.module('AvalonConnects')
    .component('home', {
      templateUrl: 'views/home.html',
      controller: [homeController],
    });
}(angular));

