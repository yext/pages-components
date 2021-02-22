import { HoursParser } from './parser.js';
import { HoursStatus } from './status.js';
import { DayToInt } from './helpers.js';

const isRequired = (name) => { throw new Error(`HoursToday: param ${name} is required`); };

class HoursToday {
  constructor({ days = isRequired('days'), time = isRequired('time'), day = isRequired('day')}) {
    this.day = day;
    this.dayIndex = DayToInt(day);
    this.time = time;
    this.days = days;
    this.yextDays = HoursParser.loadData(this);
    let { status, nextTime, nextDay } = HoursStatus.getStatus(this);
    this.nextTime = nextTime;
    this.nextDay = nextDay;
    this.status = status;
  }

  static fromElement(el, time, day) {
    const data = JSON.parse(el.dataset.days);
    return new HoursToday({days: data, time, day});
  }
}

export { HoursToday };
