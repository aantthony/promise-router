'use strict'

var express = require('express')
var ExpressRouter = express.Router

ExpressRouter.prototype = ExpressRouter

var methods = require('methods')
var slice = Array.prototype.slice

var PROTO = '__proto__'

var HEADER_CONTENT_TYPE = 'Content-Type'

function defer (promise) {
  promise.then(null, function (err) {
    setImmediate(function () {
      throw err
    })
  })
}

function Response (contentType, body) {
  this.contentType = contentType
  this.body = body
}

Router.Response = Response

module.exports = Router

function Router () {
  var expressRouter = new ExpressRouter()
  expressRouter[PROTO] = Router.prototype
  return expressRouter
}

Router.prototype[PROTO] = ExpressRouter

function promisify (handler, shouldRespond) {
  if (typeof handler.handler === 'function') {
    // it's already middleware:
    return handler
  }
  return function (req, res, next) {
    function onFulfilled (result) {
      if (result instanceof Response) {
        if (!res.get(HEADER_CONTENT_TYPE)) {
          res.set(HEADER_CONTENT_TYPE, res.contentType)
        }
        return res.send(result.body)
      } else if (shouldRespond) {
        return res.json(result)
      }
      next()
    }

    var result
    try {
      result = handler(req, res)
    } catch (ex) {
      if (ex === 'route') return next('route')
      return next(ex)
    }

    if (result && typeof result.then === 'function') {
      defer(result.then(onFulfilled, next))
    } else {
      onFulfilled(result)
    }
  }
}

// create Router#VERB functions
methods.concat('all').forEach(function (method) {
  Router.prototype[method] = function (path) {
    var route = ExpressRouter.route.call(this, path)
    var handlers = slice.call(arguments, 1)
    var middlewareHandlers = handlers.map(function (handler) {
      return promisify(handler, true)
    })
    route[method].apply(route, middlewareHandlers)
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

Router.prototype.use = function (arg1) {
  if (typeof arg1 === 'string') {
    return ExpressRouter.use.apply(this, arguments)
  }
  var middleware = promisify(arg1, false)
  return ExpressRouter.use.call(this, middleware)
}
