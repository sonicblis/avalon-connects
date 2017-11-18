(function (angular) {
  function hostController($root, $q) {
    this.account = {};
    this.editing = false;
    this.dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.minuteOptions = ['00', '15', '30', '45'];
    this.dayTimeOptions = ['AM', 'PM'];

    this.login = () => {
      firebase.auth().signInWithEmailAndPassword(this.account)
        .catch(console.error);
    };
    this.register = () => {
      if (this.account.password === this.account.confirmedPassword && this.account.password && this.account.password !== '' && this.account.email) {
        firebase.auth().createUserWithEmailAndPassword(this.account)
          .catch(console.error);
      }
    };
    this.googleLogin = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      firebase.auth().signInWithPopup(provider);
    };
    this.facebookLogin = () => {
      const provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().signInWithPopup(provider);
    };
    this.saveSettings = () => {
      $root.whenUser.then((user) => {
        user.$ref.child('settings').set(this.settings);
        this.editing = false;
      });
    };

    this.$onInit = function () {
      $root.whenUser.then((user) => {
        user.$ref.child('settings').once('value').then((snap) => {
          this.editing = !snap.exists();
          this.settings = snap.val();
          $root.$apply();
        });
      });
    };
  }

  angular.module('AvalonConnects')
    .component('host', {
      templateUrl: 'views/host.html',
      controller: ['$rootScope', '$q', hostController],
    });
}(angular));
