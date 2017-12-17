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
      this.signUp = null;
      this.attending = false;
      if (existingSignUp && group.key === existingSignUp.hostId) {
        this.signUp = existingSignUp;
        this.attending = true;
      }
    };

    this.totalAttending = 0;
    this.groups = [];
    this.userLocation = [];
    this.attenders = [];
    this.getDayDisplay = groupDateService.getDayDisplay;

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
        if (this.attending) {
          attendingInfo = {
            hostId: this.selectedGroup.key,
            count: this.signUp.count,
            bringing: this.signUp.bringing,
            name: this.signUp.name,
          };
        }
        user.$ref.child('attending').set(attendingInfo);
      });
    };

    this.$onInit = function () {
      firebase.auth().onAuthStateChanged((auth) => {
        if (auth) {
          $root.whenUser.then((user) => {
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

            user.$ref.child('attending').once('value', (snap) => {
              existingSignUp = snap.val();
            });
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

