'use strict'
var express = require('express')
var SelectController = require('../controllers/selects')
var md_auth = require('../middlewares/authenticated')

var api = express.Router()

api.get('/vehicleTypes', md_auth.ensureAuth, SelectController.getvehicleTypes)

module.exports = api;