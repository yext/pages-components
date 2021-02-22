const assert = require('assert');
import { utcOffsets } from './Hours.data.js';
import { TimeCalculator } from '../../src/js/timeCalculator.js';
let tests = [
  {
    /**
     * Browser in EDT:
     * new Date(1564612200000)
     * Wed Jul 31 2019 18:30:00 GMT-0400 (Eastern Daylight Time)
     * Germany is 6 hours ahead (CEST/GMT+2 vs EDT/GMT-4)
     */
    description: 'German Store in CEST/GMT+2, viewing from EDT/GMT-4',
    test: {
      now: new Date(1564612200000),
      utcOffsets: utcOffsets['bangOlufsenGermany'],
    },
    want: {
      time: 30,
      day: 'THURSDAY',
    }
  },
  {
    /**
     * Browser in PST:
     * new Date(1569916800000)
     * Tue Oct 01 2019 00:00:00 GMT-0800 (Pacific Standard Time)
     * Normally, Vermont is 3 hours ahead (EST/GMT-5 vs PST/GMT-8)
     * Daylight savings time is March -> November, so at this time, DST
     * would be in effect. Vermont is actually in EDT/GMT-4.
     */
    description: 'Vermont Store in EDT/GMT-4, viewing from PST/GMT-8',
    test: {
      now: new Date(1569916800000),
      utcOffsets: utcOffsets['brueggersVermont'],
    },
    want: {
      time: 400,
      day: 'TUESDAY'
    }
  },
  {
    /**
     * Browser in PST:
     * new Date(1575187200000)
     * Sun Dec 01 2019 00:00:00 GMT-0800 (Pacific Standard Time)
     * Vermont is 3 hours ahead (EST/GMT-5 vs PST/GMT-8)
     * Date is December, DST is not in effect
     */
    description: 'Vermont Store in EST/GMT-5, viewing from PST/GMT-8',
    test: {
      now: new Date(1575187200000),
      utcOffsets: utcOffsets['brueggersVermont'],
    },
    want: {
      time: 300,
      day: 'SUNDAY'
    }
  },
  {
    /**
     * Browser in HKT:
     * new Date(1554584400000)
     * Sun Apr 07 2019 05:00:00 GMT+0800 (Hong Kong Standard Time)
     * Hong Kong is 7 hours behind (HKT/GMT+8 vs BST/GMT+1)
     */
    description: 'London Store in BST/GMT+1, viewing from HKT/GMT+8',
    test: {
      now: new Date(1554584400000),
      utcOffsets: utcOffsets['chaumetLondon'],
    },
    want: {
      time: 2200,
      day: 'SATURDAY'
    }
  }
];

let testUtcOffsetConversion = function ({ test, want }) {
  let converted = TimeCalculator.calculateYextDayTime(test.now, test.utcOffsets);
  assert.deepEqual(converted, want);
};

describe('UTC Offset Conversion', (done) => {
  for(let test of tests) {
    it(test.description || 'UTC Offset Conversion test', (done) => {
      testUtcOffsetConversion(test);
      done();
    });
  }
});
