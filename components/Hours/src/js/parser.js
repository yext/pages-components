import { DayToInt } from './helpers.js';
import { YextDay } from './yextDay.js';

class HoursParser {
  static loadData({ days }) {
    return this.prepareIntervals({ days });
  }
  static prepareIntervals({ days }) { //days is a parsed json of hours.days
    let results = [];
    for (const { intervals, day, dailyHolidayHours } of days) { //iterate through each day within days
      if (dailyHolidayHours) { //prioritize holiday hours over intervals
        results[DayToInt(day)] = new YextDay(day, dailyHolidayHours.isRegularHours ? intervals : dailyHolidayHours.intervals);
      } else {
        results[DayToInt(day)] = new YextDay(day, intervals);
      }
    }
    results = results.sort((a, b) => {
      return a.dayIndex - b.dayIndex || a.start - b.start; //sort by day then by time
    });

    return results;
  }
}

export { HoursParser };
