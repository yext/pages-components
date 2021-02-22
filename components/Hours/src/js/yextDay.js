import { DayToInt } from './helpers.js';

class YextDay {
  constructor(dayName, intervals) {
    this.dayName = dayName;
    this.dayIndex = DayToInt(dayName);
    this.intervals = intervals;
  }

  //given current time, check status with context: today
  //return boolean with open status and current interval
  isOpen(time) {
    for (let interval of this.intervals) {
      if ((interval.start <= time && time < interval.end) || (interval.start <= time && interval.end <= interval.start) || (interval.start == 0 && interval.end == 2359)) {
        return {isOpen: true, interval};
      }
    }
    return {isOpen: false};
  }

  //given current time, check status with context: yesterday
  //for example: if today is Tuesday and it is 2am and Monday had an interval open from 12pm-3am, Monday.isOpenYesterday will return true
  //return boolean with open status and current interval
  isOpenYesterday(time) {
    for (let interval of this.intervals) {
      if (time < interval.end && interval.end <= interval.start) {
        return {isOpen: true, interval};
      }
    }
    return {isOpen: false};
  }

  //given time, check if there is an interval today that the location opens
  hasOpenIntervalToday(time) {
    for (let interval of this.intervals) {
      if (time < interval.start) {
        return {hasOpen: true, interval};
      }
    }
    return {hasOpen: false};
  }

  //check if today has a 24 hr interval
  is24Hours() {
    for (let interval of this.intervals) {
      if(interval.start == 0 && interval.end == 2359) {
        return {is24: true, interval};
      }
    }
    return {is24: false};
  }
}

export { YextDay };
