'use strict'
var express = require('express')
var TestController = require('../controllers/test')
var api = express.Router()

api.get('/test-push/:token/', TestController.testNotification)


module.exports = api;