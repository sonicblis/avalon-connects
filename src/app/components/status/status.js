(function (angular, firebase) {
  function statusController($scope, $root, $state, ministryService, volunteerService) {
    this.commitmentOptions = [
      { name: '3 Months', key: 3 },
      { name: '6 Months', key: 6 },
      { name: '9 Months', key: 9 },
      { name: '12 months', key: 12 },
    ];
    const removePreviousPOC = (volunteer) => {
      if (volunteer.isPOC) {
        this.volunteers.filter(v => v.positionId === volunteer.positionId && v.$id && v.$id !== volunteer.$id && v.isPOC === true)
          .forEach((v) => {
            v.isPOC = false;
            this.volunteers.$save(v);
          });
      }
    };

    this.ministries = [];
    this.positions = [];
    this.volunteers = [];
    this.topContributors = [];
    this.moods = ['fa-smile-beam', 'fa-smile', 'fa-meh', 'fa-frown', 'fa-sad-tear'];

    this.volunteer = {};
    this.addingVolunteer = false;
    this.positionCommitmentOptions = [];
    this.ministry = {}; // set when you add or edit a volunteer

    this.addVolunteer = (volunteer) => {
      if (!volunteer.isPOC) {
        volunteer.isPOC = false;
      }
      const saveVolunteer = volunteer.$id ? this.volunteers.$save : this.volunteers.$add;
      saveVolunteer(volunteer)
        .then((key) => {
          volunteer.$id = volunteer.$id || key;
          this.volunteer = {};
          this.addingVolunteer = false;
          this.volunteers.forEach((v) => {
            v.$highlight = false;
          });
          ministryService.calculateVolunteers(this.ministry);
          removePreviousPOC(volunteer);
        });
    };
    this.cancelVolunteer = () => {
      this.addingVolunteer = false;
      this.volunteers.forEach((v) => {
        v.$highlight = false;
      });
      this.volunteer = {};
    };
    this.removeVolunteer = (volunteer) => {
      this.volunteers.$remove(volunteer);
      this.deleting = false;
      this.addingVolunteer = false;
      this.volunteer = {};
    };
    this.editVolunteer = (volunteer) => {
      this.volunteer = volunteer;
      this.addingVolunteer = true;
    };
    this.getEndDate = volunteer => (volunteer.started ? ` done ${moment(volunteer.started).add(Number(volunteer.commitment), 'M').fromNow()}` : '');
    this.lastServed = volunteer => moment(volunteer.lastServed).fromNow();
    this.getNeeds = (position) => {
      let openPositions = position.minNeeded - (position.$filled || 0);
      openPositions = openPositions < 0 ? 0 : openPositions;
      position.$needed = openPositions;
      return new Array(openPositions);
    };
    this.getVolunteerCount = () => this.volunteers.filter(v => v.active).map(v => v.name).filter((v, i, s) => s.indexOf(v) === i).length;
    this.getPotentialCount = () => {
      const activeNames = this.volunteers.filter(v => v.active).map(v => v.name);
      return this.volunteers.filter(v => !v.active && !activeNames.includes(v.name)).length;
    };
    this.getPositionCount = () => this.positions.reduce((total, p) => total += p.$filled || 0, 0);
    this.getNeededCount = () => this.positions.reduce((total, p) => total += p.$needed, 0);
    this.getTopContributors = () => {
      const counts = this.volunteers.reduce((t, v) => {
        if (v.name in t) t[v.name] += 1;
        else t[v.name] = 1;
        return t;
      }, {});
      const countsAsArray = Object.keys(counts).map(k => ({ name: k, count: counts[k] }));
      countsAsArray.sort((a, b) => b.count - a.count);
      this.topContributors = countsAsArray.slice(0, 10);
    };

    this.highlight = volunteer => this.volunteers
      .filter(v => v.name === volunteer.name)
      .forEach((v) => { v.$highlight = true; });
    this.unHighlight = volunteer => this.volunteers
      .filter(v => v.name === volunteer.name)
      .forEach((v) => { v.$highlight = false; });
    this.savePosition = (position) => {
      ministryService.positions.$save(position).then(() => {
        this.editingPosition = false;
        this.position = {};
      });
    };
    this.saveMinistry = (ministry) => {
      ministryService.ministries.$save(ministry).then(() => {
        this.editingMinistry = false;
        this.ministry = {};
      });
    };

    this.$onInit = function () {
      if (!$root.user) {
        $root.blockedState = 'status';
        $state.go('login');
      } else {
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            this.ministries = ministryService.ministries;
            this.positions = ministryService.positions;
            this.ministryOwners = ministryService.ministryOwners;
            this.volunteers = volunteerService.volunteers;
            $scope.$watch(() => this.volunteer.positionId, (positionId) => {
              if (positionId) {
                const position = this.positions.find(p => p.$id === positionId);
                this.positionCommitmentOptions = [];
                Object.keys(position.commitmentOptions)
                  .filter(k => position.commitmentOptions[k])
                  .map(k => this.positionCommitmentOptions.push({
                    key: k,
                    text: `${k} Months`,
                  }));
              }
            });
            this.volunteers.$loaded(this.getTopContributors);
          }
        });
        $scope.$watch(() => this.selectedContributor, selectedContributor => {
          if (selectedContributor) {
            this.volunteers.forEach((v) => {
              v.$highlight = v.name === selectedContributor.name;
            });
          } else {
            this.volunteers.forEach((v) => {
              v.$highlight = false;
            });
          }
        });
        $scope.$watch(() => this.volunteer.name, (name) => {
          if (name && name.length > 3) {
            this.volunteers.forEach((v) => {
              v.$highlight = v.name && v.name.startsWith(name);
            });
          } else {
            this.volunteers.forEach((v) => {
              v.$highlight = false;
            });
          }
        });
        $scope.$watch(() => this.searchTerm, (term) => {
          if (term && term.length > 1) {
            this.volunteers.forEach((v) => {
              v.$highlight = v.name && v.name.toLowerCase().includes(term.toLowerCase());
            });
          } else {
            this.volunteers.forEach((v) => {
              v.$highlight = false;
            });
          }
        });
      }
    };
  }

  angular.module('AvalonServes')
    .component('status', {
      templateUrl: 'views/status.html',
      controller: ['$scope', '$rootScope', '$state', 'ministryService', 'volunteerService', statusController],
    });
}(angular, firebase));
