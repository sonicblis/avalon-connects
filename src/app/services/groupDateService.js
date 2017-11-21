(function (angular, moment) {
  angular.module('AvalonConnects')
    .service('groupDateService', function () {
      const nextFirstSunday = moment().startOf('month').day('Sunday');
      if (nextFirstSunday.date() > 7) nextFirstSunday.add(7, 'days');
      if (nextFirstSunday.isBefore()) {
        nextFirstSunday.add(1, 'months').startOf('month').day('Sunday');
        if (nextFirstSunday.date() > 7) nextFirstSunday.add(7, 'days');
      }

      this.groupStart = nextFirstSunday.toDate();
      this.groupEnd = moment(nextFirstSunday).add(6, 'days').toDate();
      this.dayOptions = [0, 1, 1, 1, 1, 1, 1].map(daysToAdd => nextFirstSunday.add(daysToAdd, 'days').format('dddd, MMM Do'));
      this.getDayDisplay = (indexAsString) => {
        const indexAsNumber = Number(indexAsString);
        if (!Number.isNaN(indexAsNumber) && this.dayOptions.length > 0) {
          return this.dayOptions[indexAsNumber];
        }
        return 'Date isn\'t set yet';
      };
    });
}(angular, moment));

