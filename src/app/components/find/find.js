(function (angular) {
  function findController($state, $root, groupDateService, refService) {
    let attenderRef = null;
    let existingSignUp = null;

    const unsubscribePreviousAttenderListeners = () => {
      if (attenderRef && attenderRef.off) {
        attenderRef.off();
      }
    };
    const subscribeAttenderListeners = (group) => {
      this.selectedGroup = group;
      this.attenders = [];
      this.totalAttending = 0;

      attenderRef = refService.addRef(firebase.database().ref('accounts')
        .orderByChild('attending/hostId')
        .equalTo(group.key));

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
        }
      });
    };
    const applyAttendenceIfRelevant = (group) => {
      if (!$root.guestMode) {
        this.signUp = null;
        this.attending = false;
        if (existingSignUp && group.key === existingSignUp.hostId) {
          this.signUp = existingSignUp;
          this.attending = true;
        }
      }
    };

    this.totalAttending = 0;
    this.groups = [];
    this.userLocation = [];
    this.attenders = [];
    this.getDayDisplay = groupDateService.getDayDisplay;
    this.displayType = localStorage.displayType || 'map';

    this.logout = () => {
      firebase.auth().signOut();
    };
    this.displayGroup = (evt, group) => {
      unsubscribePreviousAttenderListeners();
      subscribeAttenderListeners(group);
      applyAttendenceIfRelevant(group);
    };
    this.unselectGroup = () => {
      this.selectedGroup = null;
    };
    this.goHome = () => {
      $state.go('home');
    };
    this.saveSignUp = () => {
      $root.whenUser.then((user) => {
        let attendingInfo = null;
        if (this.attending || $root.guestMode) {
          attendingInfo = {
            hostId: this.selectedGroup.key,
            count: this.signUp.count,
            bringing: this.signUp.bringing || null,
            name: this.signUp.name,
          };
        }
        let userRef = user.$ref;
        if ($root.guestMode) {
          userRef = firebase.database().ref('accounts').push();
        }
        userRef.child('attending').set(attendingInfo);
      });
    };
    this.toggleDisplay = () => {
      this.displayType = this.displayType === 'map' ? 'list' : 'map';
      localStorage.displayType = this.displayType;
    };

    this.$onInit = function () {
      firebase.auth().onAuthStateChanged((auth) => {
        if (auth) {
          $root.whenUser.then((user) => {
            if ($root.guestMode) {
              this.attending = true;
            }

            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((geoInfo) => {
                this.userLocation[0] = geoInfo.coords.latitude;
                this.userLocation[1] = geoInfo.coords.longitude;
                $root.$digest();
              });
            }

            const hosts = refService.addRef(firebase.database().ref('accounts')
              .orderByChild('settings')
              .startAt(''));

            hosts.on('child_added', (snap) => {
              const group = snap.val();
              if (group.settings &&
                group.settings.groupDisabled !== true &&
                group.settings.weekday &&
                group.settings.hour &&
                group.settings.minute &&
                group.settings.dayTime &&
                group.settings.name) {
                group.position = [group.geoLocation.lat, group.geoLocation.lng];
                group.key = snap.key;
                this.groups.push(group);
                $root.$digest();
              }
            });

            hosts.once('value', () => {
              this.showMap = true;
              $root.$digest();
            });

            if (!$root.guestMode) {
              user.$ref.child('attending').once('value', (snap) => {
                if (snap.exists()) {
                  existingSignUp = snap.val();
                }
              });
            }
          });
        }
      });
    };
  }

  angular.module('AvalonConnects')
    .component('find', {
      templateUrl: 'views/find.html',
      controller: ['$state', '$rootScope', 'groupDateService', 'refService', findController],
    });
}(angular));

