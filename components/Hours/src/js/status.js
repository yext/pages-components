import { IntToDay, DayToInt } from './helpers.js';

class HoursStatus {
  //return the next valid interval in the week
  static getNextInterval(yextDays, tomorrow) {
    for(let i = 0; i < 7; i++) {
      let index = (tomorrow + i) % 7;
      for (let interval of yextDays[index].intervals) {
        return {status: "OPENSNEXT", nextTime: interval.start, nextDay: IntToDay(index)};
      }
    }
  }
  //the idea is to get the YextDay objects for yesterday and today. we ask yesterday
  //if it has an interval that overlaps into today (5pm - 3am) using isOpenYesterday.
  //we then ask today if it has an interval that is open at the current time using isOpen.
  //is yesterday.isOpenYesterday is true, then we return CLOSESTODAY with the interval overlapping from yesterday.
  //if today.isOpen is true, we check if it is 24 hours, if not we return CLOSESTODAY at the interval returned from isOpen.
  //else the store is closed and either opens sometime later today or at the next open interval sometime later in the week
  static getStatus({ time, day, yextDays }) {
    const negMod = (n, m) => ((n % m) + m) % m; // JavaScript doesnt support modulo on negative numbers
    let yesterday = DayToInt(day) - 1;
    yesterday = negMod(yesterday, 7);
    let today = DayToInt(day);
    let yesterdayIsOpen = yextDays[yesterday].isOpenYesterday(time);
    let todayIsOpen = yextDays[today].isOpen(time);
    let hasOpenIntervalToday = yextDays[today].hasOpenIntervalToday(time);

    if (yesterdayIsOpen.isOpen) {
      //check if any hours from yesterday are valid
      //dayWithHours is used to render the proper day on the hours table
      return { status: "CLOSESTODAY", nextTime: yesterdayIsOpen.interval.end, dayWithHours: yextDays[yesterday] };
    } else if (todayIsOpen.isOpen) {
      //check if open now
      if (yextDays[today].is24Hours().is24) {
        return { status: "OPEN24", dayWithHours: yextDays[today]};
      }
      //if not 24 hours, closes later today at the current intervals end time
      return { status: "CLOSESTODAY", nextTime: todayIsOpen.interval.end, dayWithHours: yextDays[today] };
    } else if (hasOpenIntervalToday.hasOpen) {
      //check if closed and has an interval later today
      return { status: "OPENSTODAY", nextTime: hasOpenIntervalToday.interval.start, dayWithHours: yextDays[today] };
    } else {
      //check if closed, get next available interval. if no intervals available return closed status without nextTime or nextDay
      let nextInfo = this.getNextInterval(yextDays, today + 1);
      if (nextInfo) {
        nextInfo.dayWithHours = yextDays[today];
      }
      return nextInfo || { status: "CLOSED", dayWithHours: yextDays[today] };
    }
  }
}

export { HoursStatus };
