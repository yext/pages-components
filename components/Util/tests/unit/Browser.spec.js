let { onReady, UserAgent } = require('../../src/js/Browser.js');

describe('Utils/Browser/onReady', function () {

  class MockDoc {
    constructor() {
      this.readyState = "notreadyatall";
      this.readyCb = function(){};
    }

    addEventListener(event, cb) {
      this.readyCb = cb;
    }

    fireReady() {
      this.readyCb();
    }
  }

  class CallbackTracker {
    constructor() {
      this.invoked = false;
    }

    cb() {
      this.invoked = true;
    }
  }

  var tracker;
  beforeEach(function() {
    global.document = new MockDoc();
    tracker = new CallbackTracker();
  });

  it('should not fire if the document is not ready', function () {
    var invoked = false;
    onReady(()=>{
      invoked = true;
    });
    invoked.should.equal(false);
  });

  it('should fire if the document is readyState:complete', function () {
    var invoked = false;
    document.readyState = "complete";
    onReady(()=>{
      invoked = true;
    });
    invoked.should.equal(true);
  });

  it('should fire if the document is readyState:loaded', function () {
    var invoked = false;
    document.readyState = "loaded";
    onReady(()=>{
      invoked = true;
    });
    invoked.should.equal(true);
  });

  it('should fire if the document is readyState:interactive', function () {
    var invoked = false;
    document.readyState = "interactive";
    onReady(()=>{
      invoked = true;
    });
    invoked.should.equal(true);
  });

  it('should fire if the document becomes ready later', function () {
    var invoked = false;
    onReady(()=>{
      invoked = true;
    });
    invoked.should.equal(false);
    global.document.fireReady();
    invoked.should.equal(true);
  });

  it('should preserve `this` context if already ready', function () {
    document.readyState = "interactive";
    onReady.bind(tracker)(tracker.cb);
    tracker.invoked.should.equal(true);
  });

  it('should preserve `this` context if becomes ready later', function () {
    onReady.bind(tracker)(tracker.cb);
    global.document.fireReady();
    tracker.invoked.should.equal(true);
  });
});

describe('Utils/Browser/UserAgent', function () {

  class MockWindow {
    constructor(ua) {
      this.navigator = {
        "userAgent": ua,
      };
    }
  }

  afterEach(function() {
    global.window = null;
  });

  it('should identify Google PageSpeed UA', function () {
    (new UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")).isGooglePageSpeed().should.equal(false);
    (new UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Google Page Speed Insights Chrome/61.0.3163.100 Safari/537.36")).isGooglePageSpeed().should.equal(true);
  });

  it('should identify Google PageSpeed UA from window', function () {
    global.window = new MockWindow("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
    UserAgent.fromWindow().isGooglePageSpeed().should.equal(false);
    global.window = new MockWindow("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Google Page Speed Insights Chrome/61.0.3163.100 Safari/537.36");
    UserAgent.fromWindow().isGooglePageSpeed().should.equal(true);
  });
});
