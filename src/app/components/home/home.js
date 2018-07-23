(function (angular) {
  function homeController() {
    this.$onInit = () => {

    };
  }

  angular.module('AvalonServes')
    .component('home', {
      templateUrl: 'views/home.html',
      controller: [homeController],
    });
}(angular));

