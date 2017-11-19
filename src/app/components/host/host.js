(function (angular) {
  function hostController($root) {
    const processAddressStatusChange = (status) => {
      this.goodAddress = false;
      switch (status) {
        case 'success':
          this.goodAddress = true;
          this.addressStatus = 'Address Verified';
          this.addressStatusIcon = 'fa-check-circle-o';
          break;
        case 'pending':
          this.addressStatus = 'Verifying Address';
          this.addressStatusIcon = 'fa-exclamation-circle';
          break;
        case 'failed':
          this.addressStatus = 'Invalid Address';
          this.addressStatusIcon = 'fa-times-circle-o';
          break;
        default:
          this.addressStatus = '';
          this.addressStatusIcon = '';
          break;
      }
    };

    this.account = {};
    this.editing = false;
    this.dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.minuteOptions = ['00', '15', '30', '45'];
    this.dayTimeOptions = ['AM', 'PM'];
    this.goodAddress = false;

    this.login = () => {
      firebase.auth().signInWithEmailAndPassword(this.account.email, this.account.password)
        .catch(console.error);
    };
    this.register = () => {
      if (this.account.password === this.account.confirmedPassword && this.account.password && this.account.password !== '' && this.account.email) {
        firebase.auth().createUserWithEmailAndPassword(this.account.email, this.account.password)
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
    this.validateAddress = () => {
      if (this.settings.street && this.settings.street !== '' && this.settings.zip) {
        $root.whenUser.then((user) => {
          processAddressStatusChange('pending');
          user.$ref.child('addressToValidate').set({
            street: this.settings.street,
            zip: this.settings.zip,
          });
        });
      }
    };
    this.logout = () => {
      firebase.auth().signOut();
    };

    this.$onInit = function () {
      $root.whenUser.then((user) => {
        user.$ref.child('settings').once('value').then((snap) => {
          this.editing = !snap.exists();
          this.settings = snap.val();
          $root.$apply();
        });

        user.$ref.child('geoLocationStatus/status').on('value', (snap) => {
          this.addressStatusClass = snap.val();
          processAddressStatusChange(this.addressStatusClass);
          $root.$apply();
        });
      });
    };
  }

  angular.module('AvalonConnects')
    .component('host', {
      templateUrl: 'views/host.html',
      controller: ['$rootScope', hostController],
    });
}(angular));
