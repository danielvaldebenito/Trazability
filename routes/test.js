'use strict'
var express = require('express')
var TestController = require('../controllers/test')
var api = express.Router()

api.get('/test-push/:token/', TestController.testNotification)
api.post('/test-push-socket/:namespace/:room/:tag', TestController.testPushSocket)

module.exports = api;