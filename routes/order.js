'use strict'
var express = require('express')
var OrderController = require('../controllers/order')
var md_auth = require('../middlewares/authenticated')
var md_wh = require('../middlewares/warehouse')
var api = express.Router()


api.get('/orders/:distributor', md_auth.ensureAuth, OrderController.getAll)
api.get('/order/:id', md_auth.ensureAuth, OrderController.getOne)
api.get('/order-resume/:distributor', md_auth.ensureAuth, OrderController.getDayResume)
api.get('/order/vehicle/:vehicle', md_auth.ensureAuth, OrderController.getAllVehicle)
api.post('/order/', [ md_auth.ensureAuth, md_wh.createAddressWarehouseForOrder, md_wh.getWarehouseFromVehicle], OrderController.saveOne)
api.put('/order/:id', md_auth.ensureAuth, OrderController.updateOne)
api.put('/order-set-en-ruta/', md_auth.ensureAuth, OrderController.setOrderEnRuta)
api.put('/order-cancel/:id', md_auth.ensureAuth, OrderController.cancelOrder)
api.put('/order-cancel-confirm/:id', md_auth.ensureAuth, OrderController.confirmCancel)
api.put('/order-assign-vehicle/', md_auth.ensureAuth, OrderController.assignVehicleToOrder)
api.delete('/order/:id', [md_auth.ensureAuth, md_auth.isAdmin], OrderController.deleteOne)

module.exports = api;