const assert = require('assert');
import { data1 } from './Hours.data.js';
import { HoursTable } from '../../src/js/hoursTable.js';

let tests = [
  {
    description: 'Unsorted - Sunday',
    test: {
      day: 'SUNDAY',
      time: 1200,
      data: data1,
      opts: {
        disableTodayFirst: true
      }
    },
    want: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
  },
  {
    description: 'Unsorted - Friday',
    test: {
      day: 'FRIDAY',
      time: 1200,
      data: data1,
      opts: {
        disableTodayFirst: true
      }
    },
    want: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
  },
  {
    description: 'Today First - Sunday',
    test: {
      day: 'SUNDAY',
      time: 1200,
      data: data1,
      opts: {
        disableTodayFirst: false
      }
    },
    want: ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
  },
  {
    description: 'Today First - Friday',
    test: {
      day: 'FRIDAY',
      time: 1200,
      data: data1,
      opts: {
        disableTodayFirst: false
      }
    },
    want: ['FRIDAY','SATURDAY','SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY']
  }
];

let testHours = function ({ test, want }) {
  let element = {
    dataset: {
      days: JSON.stringify(test.data.days)
    },
    querySelector: () => ({innerHTML: '{}'})
  };
  let yextDays = (new HoursTable({element, ...test})).yextDays;
  assert.deepEqual(yextDays.map(yextDay => yextDay.dayName), want);
}

describe('Location Hours Order', (done) => {
  for (let test of tests) {
    it(test.description || 'Hours Order test', (done) => {
      testHours(test);
      done();
    });
  }
});
