(function (angular) {
  Date.prototype.removeTime = function () { this.setHours(0, 0, 0, 0); return this.getTime(); };
  Date.prototype.isBefore = function (compareTo) {
    return compareTo.getTime ? compareTo.getTime() > this.getTime() : compareTo > this.getTime();
  };
  Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this.removeTime();
  };

  angular.module('AvalonConnects', ['ui.router', 'firebase', 'uiGmapgoogle-maps'])
    .config(['$compileProvider', '$logProvider', ($compileProvider, $logProvider) => {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|callto|tel):/);
      $logProvider.debugEnabled(false);
    }]);
}(angular));

