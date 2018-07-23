(function (angular, firebase) {
  function statusController($scope, ministryService, volunteerService) {
    this.ministries = [];
    this.positions = [];
    this.volunteers = [];
    this.moods = ['fa-smile-beam', 'fa-smile', 'fa-meh', 'fa-frown', 'fa-sad-tear'];

    this.volunteer = {};
    this.addingVolunteer = false;
    this.positionCommitmentOptions = [];

    this.addVolunteer = (volunteer) => {
      const saveVolunteer = volunteer.$id ? this.volunteers.$save : this.volunteers.$add;
      saveVolunteer(volunteer)
        .then(() => {
          this.volunteer = {};
          this.addingVolunteer = false;
        });
    };
    this.editVolunteer = (volunteer) => {
      console.log(volunteer);
      this.volunteer = volunteer;
      this.addingVolunteer = true;
    };

    this.$onInit = function () {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.ministries = ministryService.ministries;
          this.positions = ministryService.positions;
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
        }
      });
    };
  }

  angular.module('AvalonServes')
    .component('status', {
      templateUrl: 'views/status.html',
      controller: ['$scope', 'ministryService', 'volunteerService', statusController],
    });
}(angular, firebase));
