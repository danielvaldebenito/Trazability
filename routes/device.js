'use strict'
const express = require('express')
const DeviceController = require('../controllers/device');
const md_auth = require('../middlewares/authenticated');
const md_vehicle = require('../middlewares/vehicle')
const multipart = require('connect-multiparty')
const api = express.Router();

api.get('/device/config/:app', DeviceController.getConfig)
api.post('/device/register', DeviceController.registerDevice)
api.post('/device/login', md_vehicle.getVehicleFromLicensePlate, DeviceController.loginDevice)
api.post('/device/login-traza', DeviceController.loginTrazability)
api.put('/device/logout/:username', DeviceController.logout)
module.exports = api;