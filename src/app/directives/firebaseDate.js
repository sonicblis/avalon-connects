(function(angular) {
  angular.module('AvalonServes')
    .directive('firebaseDate', [function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: (scope, element, attrs, ngModel) => {
          ngModel.$parsers.push((v) => {
            if (v && v.getTime) {
              return v.getTime();
            }
            return v;
          });
          ngModel.$formatters.push((v) => {
            if (v) {
              return new Date(v);
            }
            return v;
          });
        },
      };
    }]);
}(angular));
