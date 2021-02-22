let yaInstance, jsdom;
let jsdomGlobal = require('jsdom-global');
class Dom {
  constructor() {
    this._head = '';
    this._body = '';
    this.render();
  }

  render() {
    this._dom = jsdomGlobal(`
      <html>
        <head>${this._head}</head>
        <body>${this._body}</body>
      </html>
    `);
    global.window = window;
    global.document = document;
  }

  setHead(head) {
    this.delete();
    this._head = head;
    this.render();
  }

  setBody(body) {
    this.delete();
    this._body = body;
    this.render();
  }

  delete() {
    if (this._dom) {
      this._dom();
      this._dom = null;
    }
  }
}

let fakeDom;

before(function(done) {
  this.enableTimeouts(false);
  fakeDom = new Dom();
  const Analytics = require('../../src/js/Analytics.js').Analytics;
  yaInstance = new Analytics();
  done();
});

after ((done) => {
  fakeDom.delete();
  done();
});

describe('Yext Analytics', _ => {
  describe('CalcEventName', _ => {
    it('should return data-ya-name with no scopes', (done) => {
      fakeDom.setBody(`
        <div class="Core">
          <a class="Core-link" href="https://www.yext.com/">
            Sample Link
          </a>
        </div>
      `);
      let eventName = yaInstance.CalcEventNameForElement(
        document.querySelector('.Core-link')
      );
      eventName.should.equal('link');
      done();
    });

    it('should return data-ya-name with 1 scope', (done) => {
      fakeDom.setBody(`
        <div class="Core" data-ya-scope="core">
          <a class="Core-link" href="https://www.yext.com/">
            Sample Link
          </a>
        </div>
      `);
      let eventName = yaInstance.CalcEventNameForElement(
        document.querySelector('.Core-link')
      );
      eventName.should.equal('core_link');
      done();
    });

    it('should return data-ya-name with 2 scope + custom name', (done) => {
      fakeDom.setBody(`
        <div class="Core" data-ya-scope="core">
          <div class="Core-container" data-ya-scope="container">
            <a class="Core-link" href="https://www.yext.com/" data-ya-track="cta">
              Sample Link
            </a>
          </div>
        </div>
      `);
      let eventName = yaInstance.CalcEventNameForElement(
        document.querySelector('.Core-link')
      );
      eventName.should.equal('core_container_cta');
      done();
    });

    it('should return data-ya-name with 2 scope + numbering', (done) => {
      fakeDom.setBody(`
        <div class="Core" data-ya-scope="core">
          <div class="Core-container" data-ya-scope="container">
            <a class="Core-link" href="https://www.yext.com/" data-ya-track="cta#">
              Sample Link 1
            </a>
            <a class="Core-link" href="https://www.yext.com/" data-ya-track="cta#">
              Sample Link 2
            </a>
          </div>
        </div>
      `);
      let eventName = yaInstance.CalcEventNameForElement(
        document.querySelectorAll('.Core-link')[1]
      );
      eventName.should.equal('core_container_cta2');
      done();
    });

    it('should return event name with auto number on ya-scope and ya-track', (done) => {
      fakeDom.setBody(`
        <div class="Core" data-ya-scope="core#">
          <div class="Core-container" data-ya-scope="container">
            <a class="Core-link" href="https://www.yext.com/" data-ya-track="cta#">
              Sample Link 1
            </a>
          </div>
        </div>
        <div class="Core--inverted" data-ya-scope="core#">
          <div class="Core-container" data-ya-scope="container">
            <a class="Core-link" href="https://www.yext.com/" data-ya-track="cta#">
              Sample Link 2
            </a>
          </div>
        </div>
      `);
      let eventName = yaInstance.CalcEventNameForElement(
        document.querySelector('.Core--inverted .Core-link')
      );
      eventName.should.equal('core2_container_cta1');
      done();
    });

    it('should return event name as undefined', (done) => {
      fakeDom.setBody(`
        <div class="Core" data-ya-prevent-default>
          <a class="Core-link" href="https://www.yext.com/">
            Sample Link
          </a>
        </div>
      `);
      let eventName = yaInstance.CalcEventNameForElement(
        document.querySelector('.Core-link')
      );

      let shouldBeTrue = (eventName === undefined);

      (shouldBeTrue).should.be.true;

      fakeDom.setBody(`
        <div class="Core" data-ya-prevent-default>
          <input class="Core-input" />
        </div>
      `);
      eventName = yaInstance.CalcEventNameForElement(
        document.querySelector('.Core-input')
      );

      shouldBeTrue = (eventName === undefined);

      (shouldBeTrue).should.be.true;

      fakeDom.setBody(`
        <div class="Core" data-ya-prevent-default>
          <button class="Core-button">
            Sample Button
          </button>
        </div>
      `);
      eventName = yaInstance.CalcEventNameForElement(
        document.querySelector('.Core-button')
      );

      shouldBeTrue = (eventName === undefined);

      (shouldBeTrue).should.be.true;

      done();
    });
  });
});
