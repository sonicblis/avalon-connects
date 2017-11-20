(function (angular) {
  function hostController($root, groupDateService) {
    const processAddressStatusChange = (status) => {
      this.addressStatusClass = status;
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
    this.dayOptions = groupDateService.dayOptions;
    this.hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.minuteOptions = ['00', '15', '30', '45'];
    this.dayTimeOptions = ['AM', 'PM'];
    this.goodAddress = false;
    this.loginError = null;
    this.allowReset = false;

    this.login = () => {
      firebase.auth().signInWithEmailAndPassword(this.account.email, this.account.password)
        .catch((err) => {
          this.allowReset = false;
          this.loginError = null;
          if (err.code === 'auth/user-not-found') {
            this.loginError = 'We didn\'t find that email address';
          } else if (err.code === 'auth/invalid-email') {
            this.loginError = 'That doesn\'t look like an email address';
          } else {
            this.loginError = 'Your password isn\'t right.';
            this.allowReset = true;
          }
          $root.$digest();
          console.error(err);
        });
    };
    this.register = () => {
      if (this.account.password === this.account.confirmedPassword && this.account.password && this.account.password !== '' && this.account.email) {
        firebase.auth().createUserWithEmailAndPassword(this.account.email, this.account.password)
          .catch((err) => {
            this.loginError = err;
            console.error(err);
          });
      }
    };
    this.resetPassword = () => {
      if (this.account.email) {
        firebase.auth().sendPasswordResetEmail(this.account.email);
        this.loginError = 'Check your inbox for reset instructions';
        this.allowReset = false;
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
          // save the address since validation results will also persist
          const address = {
            street: this.settings.street,
            zip: this.settings.zip,
          };
          user.$ref.child('settings').update(address);
          processAddressStatusChange('pending');
          user.$ref.child('addressToValidate').set(address);
        });
      }
    };
    this.logout = () => {
      firebase.auth().signOut();
    };
    this.getDayDisplay = (selectedDayIndex) => {
      if (this.settings && this.settings.weekday) {
        return this.dayOptions[Number(selectedDayIndex)];
      }
      return '';
    };
    this.enableGroup = (persist) => {
      this.settings.groupDisabled = false;
      if (persist) {
        $root.whenUser.then(user => user.$ref.child('settings/groupDisabled').set(false));
      }
    };
    this.disableGroup = () => {
      this.settings.groupDisabled = true;
    };

    this.$onInit = function () {
      $root.whenUser.then((user) => {
        user.$ref.child('settings').once('value').then((snap) => {
          this.editing = !snap.exists();
          this.settings = snap.val();
          $root.$apply();
        });

        user.$ref.child('geoLocationStatus/status').on('value', (snap) => {
          processAddressStatusChange(snap.val());
          $root.$apply();
        });
      });
    };
  }

  angular.module('AvalonConnects')
    .component('host', {
      templateUrl: 'views/host.html',
      controller: ['$rootScope', 'groupDateService', hostController],
    });
}(angular));
