(function (angular) {
  function hostController() {

  }

  angular.module('AvalonConnects')
    .component('host', {
      templateUrl: 'views/host.html',
      controller: [hostController],
    });
}(angular));
