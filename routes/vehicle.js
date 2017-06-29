'use strict'
var express = require('express')
var VehicleController = require('../controllers/vehicle')
var md_auth = require('../middlewares/authenticated')
var md_wh = require('../middlewares/warehouse')
var api = express.Router()

api.get('/vehicle/:distributor?/', md_auth.ensureAuth, VehicleController.getAll)
api.get('/vehicle/:id', md_auth.ensureAuth, VehicleController.getOne)
api.post('/vehicle/', [md_auth.ensureAuth, md_wh.createVehicleWarehouse], VehicleController.saveOne)
api.put('/vehicle/:id', md_auth.ensureAuth, VehicleController.updateOne)
api.delete('/vehicle/:id', [md_auth.ensureAuth, md_auth.isAdmin], VehicleController.deleteOne)

module.exports = api;