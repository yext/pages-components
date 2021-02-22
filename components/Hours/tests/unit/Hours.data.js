let data1 = {
  additionalText: '',
  days: [
    {
      day: 'MONDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'TUESDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'WEDNESDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'THURSDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'FRIDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'SATURDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'SUNDAY',
      intervals: []
    }
  ],
  holidayHours: []
};
let data2 = {
  additionalText: '',
  days: [
    {
      day: 'MONDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 200,
          start: 1630
        }
      ]
    },
    {
      day: 'TUESDAY',
      intervals: [
        {
          end: 1300,
          start: 100
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'WEDNESDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'THURSDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'FRIDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'SATURDAY',
      intervals: [
        {
          end: 1300,
          start: 930
        },
        {
          end: 2000,
          start: 1630
        }
      ]
    },
    {
      day: 'SUNDAY',
      intervals: []
    }
  ],
  holidayHours: []
};
let holidayHours1 = {
  "holidayHours": [
    {
      "date": "20190116",
      "intervals": [],
      "isClosed": true
    },
    {
      "date": "20190117",
      "intervals": [
        {
          "end": 1200,
          "start": 500
        },
        {
          "end": 1900,
          "start": 1500
        }
      ],
      "isClosed": false
    },
    {
      "date": "20190118",
      "intervals": [
        {
          "end": 2359,
          "start": 0
        }
      ],
      "isClosed": false
    },
    {
      "date": "20190119",
      "intervals": [
        {
          "end": 2100,
          "start": 500
        }
      ],
      "isClosed": false
    }
  ],
  "normalHours": [
    {
      "day": "MONDAY",
      "intervals": [
        {
          "end": 2359,
          "start": 0
        }
      ],
      "isClosed": false
    },
    {
      "day": "TUESDAY",
      "intervals": [
        {
          "end": 500,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190116",
        "intervals": [],
        "isClosed": true
      },
      "day": "WEDNESDAY",
      "intervals": [
        {
          "end": 2300,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190117",
        "intervals": [
          {
            "end": 1200,
            "start": 500
          },
          {
            "end": 1900,
            "start": 1500
          }
        ],
        "isClosed": false
      },
      "day": "THURSDAY",
      "intervals": [
        {
          "end": 500,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190118",
        "intervals": [
          {
            "end": 2359,
            "start": 0
          }
        ],
        "isClosed": false
      },
      "day": "FRIDAY",
      "intervals": [
        {
          "end": 0,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190119",
        "intervals": [
          {
            "end": 2100,
            "start": 500
          }
        ],
        "isClosed": false
      },
      "day": "SATURDAY",
      "intervals": [
        {
          "end": 1200,
          "start": 700
        },
        {
          "end": 100,
          "start": 1300
        }
      ],
      "isClosed": false
    },
    {
      "day": "SUNDAY",
      "intervals": [],
      "isClosed": true
    }
  ],
  holidayHours: []
};

let holidayHours2 = {
  "normalHours": [
    {
      "day": "MONDAY",
      "intervals": [
        {
          "end": 2359,
          "start": 0
        }
      ],
      "isClosed": false
    },
    {
      "day": "TUESDAY",
      "intervals": [
        {
          "end": 500,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190116",
        "intervals": [],
        "isRegularHours": true
      },
      "day": "WEDNESDAY",
      "intervals": [
        {
          "end": 2300,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190117",
        "intervals": [
          {
            end: 1300,
            start: 100
          }
        ],
        "isClosed": false
      },
      "day": "THURSDAY",
      "intervals": [
        {
          "end": 500,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190118",
        "intervals": [
          {
            "end": 2359,
            "start": 0
          }
        ],
        "isClosed": false
      },
      "day": "FRIDAY",
      "intervals": [
        {
          "end": 0,
          "start": 700
        }
      ],
      "isClosed": false
    },
    {
      "dailyHolidayHours": {
        "date": "20190119",
        "intervals": [],
        "isRegularHours": true
      },
      "day": "SATURDAY",
      "intervals": [],
      "isClosed": true
    },
    {
      "dailyHolidayHours": {
        "date": "20190119",
        "intervals": [],
        "isRegularHours": true
      },
      "day": "SUNDAY",
      "intervals": [
        {
          "end": 1200,
          "start": 700
        },
        {
          "end": 100,
          "start": 1300
        }
      ],
      "isClosed": true
    }
  ],
  holidayHours: []
};

const utcOffsets = {
  bangOlufsenGermany: [
    {
      "offset": 7200,
      "start": 1553994000
    },
    {
      "offset": 3600,
      "start": 1572138000
    },
    {
      "offset": 7200,
      "start": 1585443600
    }
  ],
  brueggersVermont: [
    {
      "offset": -14400,
      "start": 1552201200
    },
    {
      "offset": -18000,
      "start": 1572760800
    },
    {
      "offset": -14400,
      "start": 1583650800
    }
  ],
  chaumetLondon: [
    {
      "offset": 3600,
      "start": 1553994000
    },
    {
      "offset": 0,
      "start": 1572138000
    },
    {
      "offset": 3600,
      "start": 1585443600
    }
  ]
};

module.exports = {
  data1,
  data2,
  holidayHours1,
  holidayHours2,
  utcOffsets
}