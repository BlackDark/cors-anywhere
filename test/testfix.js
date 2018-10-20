/* eslint-env mocha */
require('dotenv').config({path: '../.env.test'});
require('./setup');

var createServer = require('../').createServer;
var request = require('supertest');
var path = require('path');
var http = require('http');
var fs = require('fs');
var assert = require('assert');

var helpTextPath = path.join(__dirname, '../lib/help.txt');
var helpText = fs.readFileSync(helpTextPath, {encoding: 'utf8'});

request.Test.prototype.expectJSON = function (json, done) {
  this.expect(function (res) {
    // Assume that the response can be parsed as JSON (otherwise it throws).
    var actual = JSON.parse(res.text);
    assert.deepEqual(actual, json);
  });
  return done ? this.end(done) : this;
};

request.Test.prototype.expectNoHeader = function (header, done) {
  this.expect(function (res) {
    if (header.toLowerCase() in res.headers) {
      return 'Unexpected header in response: ' + header;
    }
  });
  return done ? this.end(done) : this;
};

var cors_anywhere;
var cors_anywhere_port;

function stopServer(done) {
  cors_anywhere.close(function () {
    done();
  });
  cors_anywhere = null;
}

describe('Basic functionality', function () {
  before(function () {
    cors_anywhere = createServer({
      requireHeader: [],
    });
    cors_anywhere_port = cors_anywhere.listen(0).address().port;
  });
  after(stopServer);

  it('HEAD with redirect should be followed', function (done) {
    // Redirects are automatically followed, because redirects are to be
    // followed automatically per specification regardless of the HTTP verb.
    request(cors_anywhere)
      .head('/example.com/redirect')
      .redirects(0)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('some-header', 'value')
      .expect('x-request-url', 'http://example.com/redirect')
      .expect('x-cors-redirect-1', '302 http://example.com/redirecttarget')
      .expect('x-final-url', 'http://example.com/redirecttarget')
      .expect('access-control-expose-headers', /some-header,x-final-url/)
      .expectNoHeader('header at redirect')
      .expect(200, '', done);
  });



});
