(function (angular) {
  angular.module('AvalonConnects')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('home', {
          url: '/',
          component: 'home',
        })
        .state('host', {
          url: '/host',
          component: 'host',
        })
        .state('find', {
          url: '/find',
          component: 'find',
        });

      $urlRouterProvider.otherwise('/');
    }]);
}(angular));
