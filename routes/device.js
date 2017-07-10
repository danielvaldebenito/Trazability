'use strict'
var express = require('express')
var DeviceController = require('../controllers/device');
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty')
var api = express.Router();

api.get('/device/config/:app', DeviceController.getConfig)
api.post('/device/register', DeviceController.registerDevice)
api.post('/device/login', DeviceController.loginDevice)

module.exports = api;