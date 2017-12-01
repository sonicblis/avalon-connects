(function (angular, moment) {
  angular.module('AvalonConnects')
    .service('groupDateService', function () {
      const findNextGroupDays = () => {
        const nextDays = [];
        const today = moment().startOf('day');
        const firstDayOfMonth = moment(today).startOf('month');
        let firstSundayOfThisMonth = firstDayOfMonth;
        if (firstDayOfMonth.day() !== 0) {
          firstSundayOfThisMonth = moment(firstDayOfMonth).add(7 - firstDayOfMonth.day(), 'days');
        }
        for (let i = 0; i < 7; i += 1) {
          let newDay = moment(firstSundayOfThisMonth).add(i, 'days');
          if (newDay.isBefore(today.startOf('day'))) {
            newDay = moment(today).add(1, 'month').startOf('month');
            if (newDay.day() !== 0) {
              newDay.add(7 - newDay.day(), 'days').add(i, 'days');
            }
          }
          nextDays.push(newDay.format('dddd, MMM Do'));
        }
        return nextDays;
      };

      const nextFirstSunday = moment().startOf('month').day('Sunday');
      if (nextFirstSunday.date() > 7) nextFirstSunday.add(7, 'days');
      if (nextFirstSunday.isBefore()) {
        nextFirstSunday.add(1, 'months').startOf('month').day('Sunday');
        if (nextFirstSunday.date() > 7) nextFirstSunday.add(7, 'days');
      }

      this.groupStart = nextFirstSunday.toDate();
      this.groupEnd = moment(nextFirstSunday).add(6, 'days').toDate();

      this.dayOptions = findNextGroupDays();
      this.getDayDisplay = (indexAsString) => {
        const indexAsNumber = Number(indexAsString);
        if (!Number.isNaN(indexAsNumber) && this.dayOptions.length > 0) {
          return this.dayOptions[indexAsNumber];
        }
        return 'Date isn\'t set yet';
      };
    });
}(angular, moment));

