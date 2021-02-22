let LostAndFound = require('../../src/js/LostAndFound.js');

describe('404/LostAndFound/TryLowercase', function () {

  let tests = [{
    name: "should not change an already lowercased string",
    in: "http://a.com/some/url.html",
    expected: "",
  },{
    name: "should lowercase a url with uppercase characters",
    in: "http://a.com/Some/Url.html",
    expected: "http://a.com/some/url.html",
  },{
    name: "should lowercase a url with accented character",
    in: "http://a.com/Some/Ürl.html",
    expected: "http://a.com/some/ürl.html",
  }];

  for (let test of tests) {
    it(test.name, function () {
      // encodeURI() is important, otherwise ü gets compared to %C3%BC
      LostAndFound.TryLowercase({currentUrl: test.in}).should.equal(encodeURI(test.expected));
    });
  }
});

describe('404/LostAndFound/TryParent', function () {

  let tests = [{
    name: "should not attempt if no directory",
    url: "http://locations.foo.com",
    siteDomain: "locations.foo.com",
    expected: "",
  },{
    name: "should attempt one level up",
    url: "http://locations.foo.com/some/url.html",
    siteDomain: "locations.foo.com",
    expected: "http://locations.foo.com/some",
  },{
    name: "should only move one level up",
    url: "http://locations.foo.com/some/foo/bar/url.html",
    siteDomain: "locations.foo.com",
    expected: "http://locations.foo.com/some/foo/bar",
  },{
    name: "should not attempt if no directory above a reverse proxy",
    url: "http://locations.foo.com/subdir/foo.html",
    siteDomain: "locations.foo.com/subdir",
    expected: "",
  },{
    name: "should attempt if a reverse proxy where the domain doesn't match",
    url: "http://locations.foo.com/subdir/foo.html",
    siteDomain: "www.foo.com/subdir",
    expected: "http://locations.foo.com/subdir",
  }];

  for (let test of tests) {
    it(test.name, function () {
      // encodeURI() is important, otherwise ü gets compared to %C3%BC
      LostAndFound.TryParent({currentUrl: test.url, siteDomain: test.siteDomain}).should.equal(encodeURI(test.expected));
    });
  }
});
