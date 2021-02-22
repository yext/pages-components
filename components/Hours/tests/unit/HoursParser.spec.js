const assert = require('assert');
import { holidayHours1, holidayHours2 } from './Hours.data.js';
import { HoursParser } from '../../src/js/parser.js';
import { YextDay } from '../../src/js/yextDay.js';
import { DayToInt } from '../../src/js/helpers.js';

let tests = [
  {
    description: 'Holiday Hours - closed',
    test: {
      day: 'WEDNESDAY',
      data: holidayHours1,
    },
    want: new YextDay('WEDNESDAY', [])
  },
  {
    description: 'Holiday Hours - split hours',
    test: {
      day: 'THURSDAY',
      data: holidayHours1,
    },
    want: new YextDay('THURSDAY', [
      { end: 1200, start: 500 },
      { end: 1900, start: 1500 },
    ])
  },
  {
    description: 'Holiday Hours - split hours',
    test: {
      day: 'FRIDAY',
      data: holidayHours1,
    },
    want: new YextDay('FRIDAY', [
      { end: 2359, start: 0 },
    ])
  },
  {
    description: 'Holiday Hours - is regular hours',
    test: {
      day: 'WEDNESDAY',
      data: holidayHours2,
    },
    want: new YextDay('WEDNESDAY', [
      { end: 2300, start: 700 },
    ])
  },
  {
    description: 'Holiday Hours - is regular hours with closed hours',
    test: {
      day: 'SATURDAY',
      data: holidayHours2,
    },
    want: new YextDay('SATURDAY', [])
  },
  {
    description: 'Holiday Hours - is regular hours with split hours',
    test: {
      day: 'SUNDAY',
      data: holidayHours2,
    },
    want: new YextDay('SUNDAY', [
      { end: 1200, start: 700 },
      { end: 100, start: 1300 },
    ])
  },
  {
    description: 'Holiday Hours - open',
    test: {
      day: 'THURSDAY',
      data: holidayHours2,
    },
    want: new YextDay('THURSDAY', [
      { end: 1300, start: 100 },
    ])
  },
  {
    description: 'Holiday Hours - 24 hours',
    test: {
      day: 'FRIDAY',
      data: holidayHours2,
    },
    want: new YextDay('FRIDAY', [
      { end: 2359, start: 0 },
    ])
  }
];

let testHours = function ({ test, want }) {
  let yextDays = HoursParser.loadData({ days: test.data.normalHours });
  let testDayIndex = DayToInt(test.day);
  assert.deepEqual(yextDays[testDayIndex], want);
}

describe('Location Hours Parser', (done) => {
  for (let test of tests) {
    it(test.description || 'Hours Status test', (done) => {
      testHours(test);
      done();
    });
  }
});
