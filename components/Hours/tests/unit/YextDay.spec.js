const assert = require('assert');
import { YextDay } from '../../src/js/yextDay.js';
let isOpenTests = [
  {
    description: "start = end != 0",
    intervals: [
      { start: 700, end: 700 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: false },
      { time: 800, isOpen: true },
      { time: 1200, isOpen: true },
      { time: 0, isOpen: false },
      { time: 2359, isOpen: true },
    ]
  },
  {
    description: "6am - 3pm",
    intervals: [
      { start: 600, end: 1500 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: true },
      { time: 559, isOpen: false },
      { time: 730, isOpen: true },
      { time: 0, isOpen: false },
      { time: 2359, isOpen: false },
      { time: 1459, isOpen: true },
      { time: 1500, isOpen: false },
    ]
  },
  {
    description: "6am - 3pm, 4pm - 3am",
    intervals: [
      { start: 600, end: 1500 },
      { start: 1600, end: 300 },
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: true },
      { time: 559, isOpen: false },
      { time: 730, isOpen: true },
      { time: 0, isOpen: false },
      { time: 2359, isOpen: true },
      { time: 1459, isOpen: true },
      { time: 1500, isOpen: false },
      { time: 1559, isOpen: false },
      { time: 1600, isOpen: true },
    ]
  },
  {
    description: "24 hours",
    intervals: [
      { start: 0, end: 2359 },
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: true },
      { time: 559, isOpen: true },
      { time: 730, isOpen: true },
      { time: 0, isOpen: true },
      { time: 2359, isOpen: true },
      { time: 1459, isOpen: true },
      { time: 1500, isOpen: true },
      { time: 1559, isOpen: true },
      { time: 1600, isOpen: true },
    ]
  },
  {
    description: "12am - 11:59pm",
    intervals: [
      { start: 0, end: 2359 },
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: true },
      { time: 559, isOpen: true },
      { time: 730, isOpen: true },
      { time: 0, isOpen: true },
      { time: 1459, isOpen: true },
      { time: 1500, isOpen: true },
      { time: 1559, isOpen: true },
      { time: 2358, isOpen: true },
      { time: 2359, isOpen: true },
    ]
  },
];
let isOpenYesterdayTests = [
  {
    description: "start = end != 0",
    intervals: [
      { start: 700, end: 700 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: true },
      { time: 700, isOpen: false },
      { time: 800, isOpen: false },
      { time: 0, isOpen: true },
      { time: 1200, isOpen: false },
    ]
  },
  {
    description: "6am - 3pm",
    intervals: [
      { start: 600, end: 1500 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: false },
      { time: 559, isOpen: false },
      { time: 730, isOpen: false },
      { time: 0, isOpen: false },
      { time: 2359, isOpen: false },
      { time: 1459, isOpen: false },
      { time: 1500, isOpen: false },
    ]
  },
  {
    description: "6am - 3pm, 4pm - 3am",
    intervals: [
      { start: 600, end: 1500 },
      { start: 1600, end: 300 },
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, isOpen: false },
      { time: 259, isOpen: true },
      { time: 300, isOpen: false },
      { time: 1700, isOpen: false },
    ]
  },
  {
    description: "1am - 1am",
    intervals: [
      { start: 100, end: 100 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 0, isOpen: true },
      { time: 59, isOpen: true },
      { time: 100, isOpen: false },
      { time: 2359, isOpen: false },
      { time: 1700, isOpen: false },
      { time: 1200, isOpen: false },
    ]
  },
  {
    description: "2am - 5am",
    intervals: [
      { start: 200, end: 500 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 0, isOpen: false },
      { time: 59, isOpen: false },
      { time: 100, isOpen: false },
      { time: 159, isOpen: false },
      { time: 200, isOpen: false },
      { time: 459, isOpen: false },
      { time: 500, isOpen: false },
    ]
  },
  {
    description: "6am - 5am",
    intervals: [
      { start: 600, end: 500 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 0, isOpen: true },
      { time: 59, isOpen: true },
      { time: 200, isOpen: true },
      { time: 459, isOpen: true },
      { time: 500, isOpen: false },
      { time: 601, isOpen: false },
      { time: 2359, isOpen: false },
    ]
  },
];
let hasOpenIntervalTodayTests = [
  {
    description: "9am - 5pm",
    intervals: [
      { start: 900, end: 1700 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, hasOpen: true , interval: {start: 900, end: 1700}},
      { time: 859, hasOpen: true , interval: {start: 900, end: 1700}},
      { time: 900, hasOpen: false , interval: null},
      { time: 1659, hasOpen: false , interval: null},
      { time: 1700, hasOpen: false , interval: null},
    ]
  },
  {
    description: "start = end != 0",
    intervals: [
      { start: 900, end: 1700 },
      { start: 1800, end: 2300 },
    ],
    day: "MONDAY",
    assertions: [
      { time: 600, hasOpen: true , interval: {start: 900, end: 1700}},
      { time: 859, hasOpen: true , interval: {start: 900, end: 1700}},
      { time: 900, hasOpen: true, interval: { start: 1800, end: 2300 }},
      { time: 1659, hasOpen: true, interval: { start: 1800, end: 2300 }},
      { time: 1700, hasOpen: true , interval: {start: 1800, end: 2300}},
    ]
  },
];
let isOpen24Tests = [
  {
    description: "9am - 5pm",
    intervals: [
      { start: 900, end: 1700 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 0, is24: false },
      { time: 300, is24: false },
      { time: 800, is24: false },
      { time: 1300, is24: false },
      { time: 2359, is24: false },
    ]
  },
  {
    description: "12am - 12am",
    intervals: [
      { start: 0, end: 2359 }
    ],
    day: "MONDAY",
    assertions: [
      { time: 0, is24: true },
      { time: 300, is24: true },
      { time: 800, is24: true },
      { time: 1300, is24: true },
      { time: 2359, is24: true },
    ]
  },
];

let testIsOpenToday = function (test) {
  let day = new YextDay(test.day, test.intervals)
  for(let assertion of test.assertions) {
    assert.equal(day.isOpen(assertion.time).isOpen, assertion.isOpen);
  }
}
let testIsOpenYesterday = function (test) {
  let day = new YextDay(test.day, test.intervals)
  for(let assertion of test.assertions) {
    assert.equal(day.isOpenYesterday(assertion.time).isOpen, assertion.isOpen);
  }
}
let testHasOpenIntervalToday = function (test) {
  let day = new YextDay(test.day, test.intervals)
  for(let assertion of test.assertions) {
    assert.equal(day.hasOpenIntervalToday(assertion.time).hasOpen, assertion.hasOpen);
    assert.deepEqual(day.hasOpenIntervalToday(assertion.time).interval, assertion.interval);
  }
}
let testIsOpen24 = function (test) {
  let day = new YextDay(test.day, test.intervals)
  for(let assertion of test.assertions) {
    assert.equal(day.is24Hours().is24, assertion.is24);
  }
}

describe('YextDay Test', _ => {
  describe('isOpen', (done) => {
    for (let test of isOpenTests) {
      it(test.description || 'Hours Status test', (done) => {
        testIsOpenToday(test);
        done();
      });
    }
  });

  describe('isOpenYesterday', (done) => {
    for (let test of isOpenYesterdayTests) {
      it(test.description || 'Hours Status test', (done) => {
        testIsOpenYesterday(test);
        done();
      });
    }
  });

  describe('hasOpenIntervalToday', (done) => {
    for (let test of hasOpenIntervalTodayTests) {
      it(test.description || 'Hours Status test', (done) => {
        testHasOpenIntervalToday(test);
        done();
      });
    }
  });

  describe('isOpen24', (done) => {
    for (let test of isOpen24Tests) {
      it(test.description || 'Hours Status test', (done) => {
        testIsOpen24(test);
        done();
      });
    }
  });
});
