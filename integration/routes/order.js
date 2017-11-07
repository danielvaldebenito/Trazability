'use strict'
var express = require('express')
var OrderController = require('../controllers/order')
var md_auth = require('../middlewares/authenticated')
var md_order = require('../middlewares/order')
var md_order1 = require('../../middlewares/order')
var md_geocoding = require('../../middlewares/geocoding')
var md_wh = require('../../middlewares/warehouse')
var api = express.Router()

api.post('/order/', [ 
    md_auth.ensureAuth,
    md_order.firstValidate,
    md_order1.clientFromOrderByDevice,
    md_order.getDeviceFromPos,
    md_order.getDistributorByNit,
    md_geocoding.findCoordFromAddress,
    md_wh.createAddressWarehouseForOrder, 
    md_order.getVehicleFromLicensePlate,
    //md_wh.getWarehouseFromVehicle,
    md_order.getProductType,
    
], OrderController.saveOrderFromErpIntegration)
api.put('/order/', [
    md_auth.ensureAuth
], OrderController.changeOrderStateFromErpIntegration)
module.exports = api;