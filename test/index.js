'use strict'
/* global describe before it */

var Router = require('../')
var request = require('supertest')
var Promise = require('es6-promise').Promise

describe('promise-router', function () {
  var app
  before(function () {
    var router = new Router()
    .get('/sync', function (req, res) {
      if (req.query.x === 'fail') throw new Error('testing 123')
      return {x: req.query.x, y: 'abc'}
    })
    .get('/nothing', function (req, res) {
    })
    .get('/async', function (req, res) {
      return Promise.resolve({e: 'THIS_IS_A_TEST'})
    })
    .get('/async_fail', function (req, res) {
      return Promise.reject(new Error('Hello World!'))
    })
    .error(function (err, req, res) {
      res.status(400)
      return {msg: err.message}
    })

    app = require('express')().use(router)
  })

  it('should work with a non-promise return value', function (done) {
    request(app)
    .get('/sync?x=32')
    .expect('Content-Type', /json/)
    .expect(200, {
      x: '32',
      y: 'abc'
    })
    .end(done)
  })

  it('should work with a promise return value', function (done) {
    request(app)
    .get('/async')
    .expect('Content-Type', /json/)
    .expect(200, {e: 'THIS_IS_A_TEST'})
    .end(done)
  })

  it('should catch errors', function (done) {
    request(app)
    .get('/sync?x=fail')
    .expect('Content-Type', /json/)
    .expect(400, {msg: 'testing 123'})
    .end(done)
  })

  it('should catch async errors', function (done) {
    request(app)
    .get('/async_fail')
    .expect('Content-Type', /json/)
    .expect(400, {msg: 'Hello World!'})
    .end(done)
  })

  it('by default should return 200 with {} body', function (done) {
    request(app)
    .get('/nothing')
    .expect('Content-Type', /json/)
    .expect(200, {})
    .end(done)
  })

})
