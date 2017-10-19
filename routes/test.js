'use strict'
var express = require('express')
var TestController = require('../controllers/test')
var api = express.Router()

api.get('/test-push/:token/', TestController.testNotification)
api.post('/test-push-socket/:namespace/:room/:tag', TestController.testPushSocket)
api.get('/test-format-nif/:nif', TestController.testFormatNif)
module.exports = api;