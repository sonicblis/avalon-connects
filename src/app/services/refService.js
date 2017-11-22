(function (angular) {
  angular.module('AvalonConnects')
    .service('refService', function () {
      const refs = [];
      this.addRef = (ref) => {
        if (!refs.includes(ref)) {
          refs.push(ref);
        }
        return ref;
      };
      this.offAll = () => {
        refs.forEach(ref => ref.off());
      };
    });
}(angular));

