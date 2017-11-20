(function (angular) {
  function homeController(groupDateService) {
    this.groupStart = groupDateService.groupStart;
    this.groupEnd = groupDateService.groupEnd;
  }

  angular.module('AvalonConnects')
    .component('home', {
      templateUrl: 'views/home.html',
      controller: ['groupDateService', homeController],
    });
}(angular));

