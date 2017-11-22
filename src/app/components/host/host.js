(function (angular) {
  function hostController($root, groupDateService, $state, refService) {
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

    this.logout = () => {
      firebase.auth().signOut();
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
    this.goHome = () => {
      $state.go('home');
    };

    this.$onInit = function () {
      firebase.auth().onAuthStateChanged((auth) => {
        if (auth) {
          $root.whenUser.then((user) => {
            user.$ref.child('settings').once('value').then((snap) => {
              this.editing = !snap.exists();
              this.settings = snap.val();
              $root.$apply();
            });

            const statusRef = refService.addRef(user.$ref.child('geoLocationStatus/status'));
            statusRef.on('value', (snap) => {
              processAddressStatusChange(snap.val());
              $root.$apply();
            });

            this.attenders = [];
            this.totalAttending = 0;

            const attenderRef = refService.addRef(firebase.database().ref('accounts')
              .orderByChild('attending/hostId')
              .equalTo($root.user.$ref.key));

            attenderRef.on('child_added', (snap) => {
              const attender = snap.val();
              attender.key = snap.key;
              this.totalAttending += Number(attender.attending.count);
              this.attenders.push(attender);
              $root.$digest();
            });

            attenderRef.on('child_removed', (snap) => {
              const removedAttender = this.attenders.find(a => a.key === snap.key);
              if (removedAttender) {
                this.totalAttending -= Number(removedAttender.attending.count);
                this.attenders.splice(this.attenders.indexOf(removedAttender), 1);
                $root.$digest();
              }
            });
          });
        }
      });
    };
  }

  angular.module('AvalonConnects')
    .component('host', {
      templateUrl: 'views/host.html',
      controller: ['$rootScope', 'groupDateService', '$state', 'refService', hostController],
    });
}(angular));
