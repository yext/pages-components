import { HoursParser } from './parser.js';
import { HoursStatus } from './status.js';

class HoursTable {
  constructor({ element = isRequired(), day = isRequired(), time = isRequired(), opts = {} }) {
    this.element = element;
    this.day = day;
    this.time = time;
    this.days = JSON.parse(element.dataset.days);
    this.yextDays = HoursParser.loadData(this);
    let { dayWithHours } = HoursStatus.getStatus(this);
    this.todayIndex = dayWithHours.dayIndex;
    this.config = JSON.parse(element.querySelector('.js-hours-config').innerHTML);
    Object.assign(this.config, opts);

    //dayWithHours is the day that will be highlighted on the table.

    if (!this.config.disableTodayFirst) {
      //sort table days from today for when we call sortByToday in renderer
      const beforeToday = this.yextDays.slice(0, this.todayIndex);
      const fromToday = this.yextDays.slice(this.todayIndex);
      this.yextDays = fromToday.concat(beforeToday);
    }

    if (this.config.disableTodayFirst && this.config.weekStartsOn) {
      // Sort table days such that they start on the day config.weekStartsOn
      const startDay = this.yextDays.find(day => day.dayName === this.config.weekStartsOn);
      const startIndex = this.yextDays.indexOf(startDay);
      const beforeStart = this.yextDays.slice(0, startIndex);
      const fromStart = this.yextDays.slice(startIndex);
      this.yextDays = fromStart.concat(beforeStart);
    }

    this.config.hours = this.yextDays.map(
      yextDay => ({day: yextDay.dayName, intervals: yextDay.intervals})
    );
  }
}

const isRequired = () => { throw new Error('param is required'); };


export { HoursTable };
