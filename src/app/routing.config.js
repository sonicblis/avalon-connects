(function (angular) {
  angular.module('AvalonServes')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('home', {
          url: '/',
          component: 'home',
        })
        .state('control', {
          url: '/setup',
          component: 'control',
        })
        .state('login', {
          url: '/login',
          component: 'login',
        })
        .state('status', {
          url: '/status',
          component: 'status',
        });

      $urlRouterProvider.otherwise('/');
    }]);
}(angular));
