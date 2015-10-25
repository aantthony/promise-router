# promised-router


[![NPM Version](https://img.shields.io/npm/v/promised-router.svg)](https://www.npmjs.com/package/promised-router)
[![License](https://img.shields.io/npm/l/promised-router.svg)](https://www.npmjs.com/package/promised-router)
[![Build Status](https://img.shields.io/travis/aantthony/promised-router/master.svg)](https://travis-ci.org/aantthony/promised-router)

Express Router with promises.

Allows you to define express routes that return promises instead of calling `next()`.

`npm install --save promised-router`

If the promise resolves successfully, then it is sent to `res.json(result)`.

Otherwise, if the promise rejects, then the error reason is passed to `next(err)`.

The `router` object can be passed to an ordinary `express.use('/path', router)` call.

It also supports `.param()` and `.use()`, with the only other difference being that error handlers are now added using `.error()` instead of `.use()`. This was done because it depends on `fn.length` which can be counter-intuitive sometimes.

To simulate `next('route')`, simply `throw 'route'`.

## Usage

```js
const Router = require('promised-router');

module.exports = new Router()
.param('userId', req => {
  return User.findById(req.params.userId)
  .then(user => req.user = user);
})
.use(function (req, res) {
  return Session.findById(req.query.access_token)
  .then(session => req.session = session);
})
.get('/example/:id', function (req, res) {
  return User.findById(req.params.id);
})
.use('/other', require('./other_routes'))
.error(function (err, req, res) {
  res.status(400);
  return {message: err.message};
})
```

... translates to ...


```js
const Router = require('express').Router;

module.exports = new Router()
.param('userId', function (req, res, next) {
  User.findById(req.params.userId)
  .then(function (user) {
    req.user = user;
    next();
  }, next);
})
.use(function (req, res, next) {
  Session.findById(req.query.access_token)
  .then(session => req.session = session)
  .then(function () {
    next();
  }, next);
})
.get('/example/:id', function (req, res, next) {
  return User.findById(req.params.id)
  .then(function (user) {
    res.json(user);
  }, next);
})
.use('/other', require('./other_routes'))
.use(function (err, req, res, next) { //eslint-disable-line
  res.status(400);
  res.json({message: err.message});
})
```
