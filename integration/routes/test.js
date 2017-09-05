'use strict'
var express = require('express')
var Controller = require('../controllers/test')
var api = express.Router()

api.get('/test-get/', Controller.testget)
api.post('/test-post/', Controller.testpost)

module.exports = api;