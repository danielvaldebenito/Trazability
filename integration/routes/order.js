'use strict'
var express = require('express')
var OrderController = require('../controllers/order')
var md_auth = require('../middlewares/authenticated')
var md_order = require('../middlewares/order')
var md_wh = require('../../middlewares/warehouse')
var api = express.Router()

api.post('/order/', [ 
    md_auth.ensureAuth, 
    md_order.findClient,
    md_order.findCoord,
    md_wh.createAddressWarehouseForOrder, 
    // getVehicle,
    md_wh.getWarehouseFromVehicle
], OrderController.saveOne)

module.exports = api;