const assert = require('assert');
import { HoursStatus } from '../../src/js/status.js';
import { HoursParser } from '../../src/js/parser.js';
import { YextDay } from '../../src/js/yextDay.js';
import { holidayHours1 } from './Hours.data.js';
let tests = [
  {
    description: 'Split Hours - opens next',
    test: {
      day: 'SATURDAY',
      time: 2100,
      data: holidayHours1,
    },
    want: {
      status: 'OPENSNEXT',
      nextTime: 0,
      nextDay: 'MONDAY',
      dayWithHours: new YextDay('SATURDAY', [
        { end: 2100, start: 500 },
      ]),
    }
  },
  {
    description: 'Split Hours - closes today',
    test: {
      day: 'MONDAY',
      time: 1700,
      data: holidayHours1,
    },
    want: {
      status: 'OPEN24',
      dayWithHours: new YextDay('MONDAY', [
        { end: 2359, start: 0 },
      ]),
    }
  },
  {
    description: 'Holiday Closed Hours - opens next',
    test: {
      day: 'WEDNESDAY',
      time: 1700,
      data: holidayHours1,
    },
    want: {
      status: 'OPENSNEXT',
      nextTime: 500,
      nextDay: 'THURSDAY',
      dayWithHours: new YextDay('WEDNESDAY', []),
    }
  }
];

let testHoursStatus = function ({ test, want }) {
  let yextDays = HoursParser.loadData({ days: test.data.normalHours });
  let status = HoursStatus.getStatus({
    time: test.time,
    day: test.day,
    yextDays
  });
  assert.deepEqual(status, want);
}

describe('Hours Status', (done) => {
  for(let test of tests) {
    it(test.description || 'Hours Status test', (done) => {
      testHoursStatus(test);
      done();
    });
  }
});
