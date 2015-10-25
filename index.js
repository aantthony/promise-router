'use strict'

var express = require('express')
var ExpressRouter = express.Router

ExpressRouter.prototype = ExpressRouter

var methods = require('methods')

var PROTO = '__proto__'

function defer (promise) {
  promise.then(null, function (err) {
    setImmediate(function () {
      throw err
    })
  })
}

module.exports = Router

function Router () {
  var expressRouter = new ExpressRouter()
  expressRouter[PROTO] = Router.prototype
  return expressRouter
}

Router.prototype[PROTO] = ExpressRouter

function promisify (handler, shouldRespond) {
  return function (req, res, next) {
    function onFulfilled (responseBody) {
      if (shouldRespond) return res.json(responseBody)
      next()
    }

    var result = handler(req, res)
    if (result && typeof result.then === 'function') {
      defer(result.then(onFulfilled, next))
    } else {
      onFulfilled(result)
    }
  }
}

// create Router#VERB functions
methods.concat('all').forEach(function (method) {
  Router.prototype[method] = function (path, handler) {
    var route = ExpressRouter.route.call(this, path)
    var middleware = promisify(handler, true)
    route[method].apply(route, [middleware]) // eslint-disable-line no-useless-call
    return this
  }
})

Router.prototype.error = function (handler) {
  var middleware = function (err, req, res, next) {
    var result = handler(err, req, res)
    if (result && typeof result.then === 'function') {
      defer(result.then(function (result) {
        res.json(result)
      }, next))
    } else {
      res.json(result)
    }
  }

  return ExpressRouter.use.call(this, middleware)
}

Router.prototype.param = function (paramName, handler) {
  var middleware = promisify(handler, false)
  return ExpressRouter.param.call(this, paramName, middleware)
}

Router.prototype.use = function (arg1, arg2) {
  if (typeof arg1 === 'string') {
    return ExpressRouter.use.call(this, arg1, arg2)
  }
  var middleware = promisify(arg1, false)
  return ExpressRouter.use.call(this, middleware)
}
