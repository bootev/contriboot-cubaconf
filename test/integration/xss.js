var helper = require('./helpers/helper.js'),
    url = helper.BASE_URL,
    Lab = require('lab'),
    describe = Lab.experiment,
    it = Lab.test,
    before = Lab.before,
    after = Lab.after,
    expect = Lab.expect,
    fillOutSubmission = require('./helpers/fill-out-submission-without-twittername.js');


describe('XSS', function () {
  var browser;
  helper.testHelper(before, after, function (browserInstance, done) {
    browser = browserInstance;
    done();
  });

  //@see https://github.com/jsunconf/contriboot/issues/69
  it('allows to include constructs looking like html tags without prematurely ending the input', helper.options, function (done) {
    var b = browser.get(url + '/contributions/new'),
        values = {
          title: 'someTitle',
          name: 'someName',
          description: 'Awesome <5kb foo'
        };

    fillOutSubmission(b, values)
        .elementByTagName('body')
        .text()
        .then(function (value) {
          console.log(value);
          return expect(value).to.contain('Awesome <5kb foo');
        })
        .nodeify(done);
  });
  
  it('escapes markup', helper.options, function (done) {
    var b = browser.get(url + '/contributions/new'),
        values = {
          title: '<b>title</b>',
          name: '<b>name</b>',
          description: '<script>alert("ente ente")</script>'
        };

    fillOutSubmission(b, values)
      .elementByTagName('body')
      .getAttribute('innerHTML')
      .then(function (value) {
        expect(value).to.contain('&lt;b&gt;title&lt;/b&gt;');
        expect(value).to.contain('&lt;b&gt;name&lt;/b&gt;');
        return expect(value).to.contain('&lt;script&gt;alert("ente ente")&lt;/script&gt;');
      })
      .nodeify(done);
  });
});
