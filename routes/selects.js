'use strict'
var express = require('express')
var SelectController = require('../controllers/selects')
var md_auth = require('../middlewares/authenticated')

var api = express.Router()

api.get('/vehicleTypes', md_auth.ensureAuth, SelectController.getvehicleTypes)
api.get('/inicialdata/:distributor', md_auth.ensureAuth, SelectController.initialDataToDevice)
api.get('/country', md_auth.ensureAuth, SelectController.getCountryData)
module.exports = api;